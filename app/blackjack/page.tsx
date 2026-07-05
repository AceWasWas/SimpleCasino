import GamePagePlaceholder from "@/components/GamePagePlaceholder";
import { getGame } from "@/lib/games";

export default function BlackjackPage() {
  return <GamePagePlaceholder game={getGame("blackjack")!} />;
}
