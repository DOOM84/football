import type {IError} from "~/types/interfaces";
import prisma from "~/helpers/prisma";

export default defineEventHandler(async (event) => {

    try {
        // @ts-ignore: Unreachable code error
        BigInt.prototype.toJSON = function (): string {
            return this.toString();
        };

        const year = (parseInt((new Date().getFullYear() + '').slice(-2))-1).toString() as string;

        const ecupStands = await prisma.ecupStand.findMany();
        const ecupResults = await prisma.ecupResult.findMany();
        const results = await prisma.result.findMany();
        const matchInfo = await prisma.matchInfo.findMany();
        const teams = await prisma.team.findMany({
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
        await prisma[`team${year}`].createMany({
            data: teams
        })
        await prisma[`matchInfo${year}`].createMany({
            data: matchInfo
        })

        await prisma.ecupStand.deleteMany();
        await prisma.matchInfo.deleteMany();
        await prisma.ecupResult.deleteMany();
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
