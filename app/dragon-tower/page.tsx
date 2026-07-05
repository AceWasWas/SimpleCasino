import GamePagePlaceholder from "@/components/GamePagePlaceholder";
import { getGame } from "@/lib/games";

export default function DragonTowerPage() {
  return <GamePagePlaceholder game={getGame("dragon-tower")!} />;
}
