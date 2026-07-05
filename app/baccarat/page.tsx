import GamePagePlaceholder from "@/components/GamePagePlaceholder";
import { getGame } from "@/lib/games";

export default function BaccaratPage() {
  return <GamePagePlaceholder game={getGame("baccarat")!} />;
}
