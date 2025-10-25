import { capitalizeString } from "@/utils/strings.util";

export const StatusBadge = ({ status }: { status?: string }) => {

    let className = 'bg-green-700 text-white';

    switch (status) {
        case 'COMPLETED':
        case 'ACCEPTED':
        case 'DELIVERED':
            className = 'bg-green-700 text-white';
            break;
        case 'PAID':
            className = 'bg-primary text-white';
            break;
        case 'CONFIRMED':
        case 'PENDING':
            className = 'bg-yellow-700 text-white';
            break;
        case 'IN_TRANSIT':
            className = 'bg-blue-700 text-white';
            break;
        case 'CANCELLED':
            className = 'bg-red-700 text-white';
            break;
        case 'CREATED':
            className = 'bg-gray-700 text-white';
            break;
    }

    return (
        <p className={`${className} p-1 px-3 rounded-md text-white text-center text-sm`}>
            {capitalizeString(status)}
        </p>
    )
}
