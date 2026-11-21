import { listConsumptions } from "@/lib/api-client/consumptions";
import { Suspense } from "react";
import { ButtonLink } from "@/components/button";
import { parseRouteId } from "@/lib/route-helpers";
import type { YearGroup } from "@/lib/consumption-group";
import { groupByYear, totalMonth, YearTotals } from "@/lib/consumption-group";
import { formatKwh } from "@/lib/format";
import { monthName } from "@/lib/period";
 
type Props = PageProps<"/results/[RoomId]">;

export default function RoomResultsPage(props: Props)
{
    return (
        //the roomhistory
        <RoomHistory params={props.params} />
    )
}

export async function RoomHistory({params}: {params: Props["params"]})
{
    const roomId = parseRouteId((await params).RoomId);
    const consumptions = await listConsumptions({roomId});
    return (
        <>
            <ButtonLink href="/results" className="">
                <span>←</span>
                Retour aux résultats
            </ButtonLink>
            <h1 className="text-2xl font-bold mt-2">Résultat pour la salle {consumptions[0]?.roomName || "Salle inconnue"}</h1>

            {
                consumptions.length === 0 ? (
                    <p className="text-muted-foreground rounded-lg border border-muted p-3">Aucune consommation trouvée pour cette salle.</p>
                ) : (
                    <div>
                        {groupByYear(consumptions).map((consumption) => (
                            <div className="m-6" key={consumption.year}>
                                <h2>{consumption.year}</h2>
                                <YearSection group={consumption} key={consumption.year}/>
                            </div>
                        ))}
                    </div>
                )

            }
        </>
    )
}

export function YearSection({group}: {group: YearGroup})
{
    const yearTotals = YearTotals(group);
    return (
        <div className="mt-6">
            <table className="w-full min-w-[36rem] text-left">
            <caption className="sr-only">Consommation totale en kWh par salle et par type d&apos;énergie</caption>
                <thead className="border-b border-border bg-background text-sm text-muted-foreground">
                <tr>
                    <th scope="col" className="px-4 py-2 font-semibold">Mois</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">Jirama (kWh)</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">Solaire (kWh)</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">Groupe électrogène (kWh)</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">Total Mois (kWh)</th>
                </tr>
                </thead>
                <tbody>
                {group.consumptions.map((consumption) => (
                    <tr key={consumption.id} className="border-t border-border first:border-t-0">
                        <td className="px-4 py-2">{monthName(consumption.month)}</td>
                        <td className="px-4 py-2 text-right">{formatKwh(consumption.jiramaKwh)}</td>
                        <td className="px-4 py-2 text-right">{formatKwh(consumption.solarKwh)}</td>
                        <td className="px-4 py-2 text-right">{formatKwh(consumption.generatorKwh)}</td>
                        <td className="px-4 py-2 text-right font-semibold">{formatKwh(totalMonth(consumption))}</td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                    <tr className="border-t">
                        <td className="px-4 py-2 font-semibold">Total {group.year}</td>
                        <td className="px-4 py-2 text-right">{formatKwh(yearTotals.jiramaKwh)}</td>
                        <td className="px-4 py-2 text-right">{formatKwh(yearTotals.solarKwh)}</td>
                        <td className="px-4 py-2 text-right">{formatKwh(yearTotals.generatorKwh)}</td>
                        <td className="px-4 py-2 text-right font-semibold">{formatKwh(yearTotals.total)}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    )
}