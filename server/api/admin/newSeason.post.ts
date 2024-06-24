import type {IError} from "~/types/interfaces";
import prisma from "~/helpers/prisma";
import type {Season} from "~/types/types";

export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const year = parseInt((new Date().getFullYear() + '').slice(-2))-1 as Season;

        const ecupStands = await prisma.ecupStand.findMany();
        const ecupResults = await prisma.ecupResult.findMany();
        const cupResults = await prisma.cupResult.findMany();
        const results = await prisma.result.findMany();
        const leagueResults = await prisma.leagueResult.findMany();
        const matchInfo = await prisma.matchInfo.findMany();
        const teams = await prisma.team.findMany({
            where: {status: true}
        });
        const leagueTeams = await prisma.leagueTeam.findMany({
            where: {status: true}
        });

        await prisma[`ecupStand${year}`].createMany({
            data: ecupStands
        })

        await prisma[`ecupResult${year}`].createMany({
            data: ecupResults
        })

        await prisma[`result${year}`].createMany({
            data: results
        })

        await prisma[`cupResult${year}`].createMany({
            data: cupResults
        })

        await prisma[`leagueResult${year}`].createMany({
            data: leagueResults
        })

        await prisma[`team${year}`].createMany({
            data: teams as any
        })

        await prisma[`leagueTeam${year}`].createMany({
            data: leagueTeams as any
        })

        await prisma[`matchInfo${year}`].createMany({
            data: matchInfo as any
        })

        await prisma.ecupStand.deleteMany();
        await prisma.matchInfo.deleteMany();
        await prisma.ecupResult.deleteMany();
        await prisma.cupResult.deleteMany();
        await prisma.leagueResult.deleteMany();
        await prisma.result.deleteMany();
        await prisma.team.updateMany({
            data: {
                games: 0,
                win: 0,
                draw: 0,
                lost: 0,
                goals: 0,
                missed: 0,
                diff: 0,
                points: 0,
                order: 0,
            }
        });
        await prisma.leagueTeam.updateMany({
            data: {
                games: 0,
                win: 0,
                draw: 0,
                lost: 0,
                goals: 0,
                missed: 0,
                diff: 0,
                points: 0,
                order: 0,
            }
        });

        return {res: true};

    } catch (e) {

        console.log(e);

        const typedError = e as IError;

        if (typedError.path && typedError.errors?.length) {
            throw createError({
                statusCode: 422,
                message: typedError.errors[0]
            })
        } else {
            throw createError({
                statusCode: 404,
                message: 'Error occurred'
            })
        }
    }
})
