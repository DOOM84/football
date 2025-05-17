
export default function (positionId: number) {
    return positionId === 1
        ? 'Голкипер' : positionId === 2 ? 'Защитник' :
            positionId === 3 ? 'Полузащитник' : positionId === 4 ? 'Нападающий' : '';
}


