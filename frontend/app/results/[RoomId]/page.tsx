import { listConsumptions } from "@/lib/api-client/consumptions";

type Props = PageProps<"/results/[RoomId]">;

export default async function RoomResultsPage(props: Props)
{
    const { RoomId } = await props.params;
    const consumptions = await listConsumptions({roomId: Number(RoomId)});
    return <h1 className="mb-2 text-2xl font-semibold">Résultat de la salle {consumptions[0].roomName}</h1>
}