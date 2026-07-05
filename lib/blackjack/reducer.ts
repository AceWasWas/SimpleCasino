import {
  countValue,
  createShoe,
  handValue,
  isNaturalBlackjack,
  RESHUFFLE_THRESHOLD,
} from "./engine";
import type { Card, GameState, PlayerHand } from "./types";

export const initialState: GameState = {
  shoe: [],
  runningCount: 0,
  dealerCards: [],
  dealerHoleRevealed: false,
  playerHands: [],
  activeHandIndex: 0,
  phase: "idle",
  message: "Deal a hand to start.",
  showCount: false,
  stats: { hands: 0, wins: 0, losses: 0, pushes: 0, blackjacks: 0 },
};

export type Action =
  | { type: "DEAL" }
  | { type: "HIT" }
  | { type: "STAND" }
  | { type: "DOUBLE" }
  | { type: "SPLIT" }
  | { type: "DEALER_DRAW" }
  | { type: "REVEAL_HOLE" }
  | { type: "SETTLE" }
  | { type: "TOGGLE_COUNT" };

let idSeq = 0;
function nextId(prefix: string): string {
  idSeq += 1;
  return `${prefix}-${idSeq}`;
}

function newHand(cards: Card[], opts: Partial<PlayerHand> = {}): PlayerHand {
  return {
    id: nextId("hand"),
    cards,
    status: "active",
    fromSplit: false,
    isAceSplit: false,
    doubled: false,
    ...opts,
  };
}

function findNextActive(hands: PlayerHand[], fromIndex: number): number {
  for (let i = fromIndex; i < hands.length; i++) {
    if (hands[i].status === "active") return i;
  }
  return -1;
}

function settleHands(state: GameState, prefix = ""): GameState {
  const dealerTotal = handValue(state.dealerCards).total;
  const dealerBust = dealerTotal > 21;

  let wins = 0;
  let losses = 0;
  let pushes = 0;
  let blackjacks = 0;

  const playerHands = state.playerHands.map((hand) => {
    if (hand.result) {
      if (hand.result === "win" || hand.result === "blackjack") wins++;
      else if (hand.result === "lose") losses++;
      else pushes++;
      if (hand.result === "blackjack") blackjacks++;
      return hand;
    }

    let result: PlayerHand["result"];
    if (hand.status === "bust") {
      result = "lose";
    } else {
      const total = handValue(hand.cards).total;
      if (dealerBust || total > dealerTotal) result = "win";
      else if (total < dealerTotal) result = "lose";
      else result = "push";
    }

    if (result === "win") wins++;
    else if (result === "lose") losses++;
    else pushes++;

    return { ...hand, result };
  });

  const won = wins > 0;
  const lost = losses > 0;
  let message: string;
  if (playerHands.length > 1) {
    message = `Round over — ${wins}W / ${losses}L / ${pushes}P across your hands.`;
  } else if (playerHands[0]?.result === "blackjack") {
    message = "Blackjack! You win.";
  } else if (won && !lost) {
    message = "You win!";
  } else if (lost && !won) {
    message = dealerBust ? "Dealer busts — you win!" : "Dealer wins.";
  } else if (playerHands[0]?.result === "push") {
    message = "Push — it's a tie.";
  } else {
    message = "Round over.";
  }

  return {
    ...state,
    playerHands,
    phase: "round-over",
    message: prefix + message,
    stats: {
      hands: state.stats.hands + 1,
      wins: state.stats.wins + wins,
      losses: state.stats.losses + losses,
      pushes: state.stats.pushes + pushes,
      blackjacks: state.stats.blackjacks + blackjacks,
    },
  };
}

export function blackjackReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "TOGGLE_COUNT":
      return { ...state, showCount: !state.showCount };

    case "DEAL": {
      let shoe = state.shoe;
      let runningCount = state.runningCount;
      let message = "";
      if (shoe.length < RESHUFFLE_THRESHOLD) {
        shoe = createShoe();
        runningCount = 0;
        message = "New shoe shuffled (4 decks). ";
      }

      shoe = [...shoe];
      const draw = (): Card => {
        const card = shoe.pop()!;
        runningCount += countValue(card.rank);
        return card;
      };

      const p1 = draw();
      const dUp = draw();
      const p2 = draw();
      const dHole = draw();

      const playerCards = [p1, p2];
      const dealerCards = [dUp, dHole];
      const upValueIsTenOrAce = dUp.rank === "A" || ["10", "J", "Q", "K"].includes(dUp.rank);
      const playerBJ = isNaturalBlackjack(playerCards);

      if (upValueIsTenOrAce) {
        const dealerBJ = isNaturalBlackjack(dealerCards);
        if (dealerBJ) {
          // Dealer peeks and reveals blackjack — round ends immediately.
          runningCount += countValue(dHole.rank);
          const hand = newHand(playerCards, {
            status: "stood",
            result: playerBJ ? "push" : "lose",
          });
          return settleHands(
            {
              ...state,
              shoe,
              runningCount,
              dealerCards,
              dealerHoleRevealed: true,
              playerHands: [hand],
              activeHandIndex: 0,
              phase: "player-turn",
            },
            message,
          );
        }
      }

      if (playerBJ) {
        // Player blackjack with no dealer blackjack: instant win. The hole
        // card was never looked at, so it stays unknown to the count.
        const hand = newHand(playerCards, { status: "stood", result: "blackjack" });
        return settleHands(
          {
            ...state,
            shoe,
            runningCount,
            dealerCards,
            dealerHoleRevealed: false,
            playerHands: [hand],
            activeHandIndex: 0,
            phase: "player-turn",
          },
          message,
        );
      }

      return {
        ...state,
        shoe,
        runningCount,
        dealerCards,
        dealerHoleRevealed: false,
        playerHands: [newHand(playerCards)],
        activeHandIndex: 0,
        phase: "player-turn",
        message: message + "Your move.",
      };
    }

    case "HIT": {
      if (state.phase !== "player-turn") return state;
      const shoe = [...state.shoe];
      const card = shoe.pop()!;
      const runningCount = state.runningCount + countValue(card.rank);

      const hands = [...state.playerHands];
      const idx = state.activeHandIndex;
      const hand = hands[idx];
      const cards = [...hand.cards, card];
      const total = handValue(cards).total;
      const status = total > 21 ? "bust" : total === 21 ? "stood" : "active";
      hands[idx] = { ...hand, cards, status };

      if (status !== "active") {
        const nextIdx = findNextActive(hands, idx + 1);
        if (nextIdx === -1) {
          return { ...state, shoe, runningCount, playerHands: hands, phase: "dealer-turn" };
        }
        return { ...state, shoe, runningCount, playerHands: hands, activeHandIndex: nextIdx };
      }

      return { ...state, shoe, runningCount, playerHands: hands };
    }

    case "STAND": {
      if (state.phase !== "player-turn") return state;
      const hands = [...state.playerHands];
      const idx = state.activeHandIndex;
      hands[idx] = { ...hands[idx], status: "stood" };

      const nextIdx = findNextActive(hands, idx + 1);
      if (nextIdx === -1) {
        return { ...state, playerHands: hands, phase: "dealer-turn" };
      }
      return { ...state, playerHands: hands, activeHandIndex: nextIdx };
    }

    case "DOUBLE": {
      if (state.phase !== "player-turn") return state;
      const idx = state.activeHandIndex;
      const hand = state.playerHands[idx];
      if (hand.cards.length !== 2 || hand.status !== "active") return state;

      const shoe = [...state.shoe];
      const card = shoe.pop()!;
      const runningCount = state.runningCount + countValue(card.rank);
      const cards = [...hand.cards, card];
      const total = handValue(cards).total;
      const status = total > 21 ? "bust" : "stood";

      const hands = [...state.playerHands];
      hands[idx] = { ...hand, cards, status, doubled: true };

      const nextIdx = findNextActive(hands, idx + 1);
      if (nextIdx === -1) {
        return { ...state, shoe, runningCount, playerHands: hands, phase: "dealer-turn" };
      }
      return { ...state, shoe, runningCount, playerHands: hands, activeHandIndex: nextIdx };
    }

    case "SPLIT": {
      if (state.phase !== "player-turn") return state;
      const idx = state.activeHandIndex;
      const hand = state.playerHands[idx];
      const canSplit =
        hand.status === "active" &&
        hand.cards.length === 2 &&
        hand.cards[0].rank === hand.cards[1].rank &&
        state.playerHands.length < 4;
      if (!canSplit) return state;

      const shoe = [...state.shoe];
      const draw = (): Card => shoe.pop()!;
      const [cardA, cardB] = hand.cards;
      const isAceSplit = cardA.rank === "A";

      const newCardA = draw();
      const newCardB = draw();
      const runningCount =
        state.runningCount + countValue(newCardA.rank) + countValue(newCardB.rank);

      const handA = newHand([cardA, newCardA], {
        fromSplit: true,
        isAceSplit,
        status: isAceSplit ? "stood" : "active",
      });
      const handB = newHand([cardB, newCardB], {
        fromSplit: true,
        isAceSplit,
        status: isAceSplit ? "stood" : "active",
      });

      const hands = [...state.playerHands];
      hands.splice(idx, 1, handA, handB);

      const nextIdx = findNextActive(hands, idx);
      if (nextIdx === -1) {
        return { ...state, shoe, runningCount, playerHands: hands, phase: "dealer-turn" };
      }
      return { ...state, shoe, runningCount, playerHands: hands, activeHandIndex: nextIdx };
    }

    case "REVEAL_HOLE": {
      if (state.dealerHoleRevealed) return state;
      const holeCard = state.dealerCards[1];
      const runningCount = state.runningCount + countValue(holeCard.rank);
      return { ...state, dealerHoleRevealed: true, runningCount };
    }

    case "DEALER_DRAW": {
      const shoe = [...state.shoe];
      const card = shoe.pop()!;
      const runningCount = state.runningCount + countValue(card.rank);
      return { ...state, shoe, runningCount, dealerCards: [...state.dealerCards, card] };
    }

    case "SETTLE":
      return settleHands(state);

    default:
      return state;
  }
}
