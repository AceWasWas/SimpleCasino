import GamePagePlaceholder from "@/components/GamePagePlaceholder";
import { getGame } from "@/lib/games";

export default function MinesweeperPage() {
  return <GamePagePlaceholder game={getGame("minesweeper")!} />;
}
