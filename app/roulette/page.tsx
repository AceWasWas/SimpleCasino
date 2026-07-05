import GamePagePlaceholder from "@/components/GamePagePlaceholder";
import { getGame } from "@/lib/games";

export default function RoulettePage() {
  return <GamePagePlaceholder game={getGame("roulette")!} />;
}
