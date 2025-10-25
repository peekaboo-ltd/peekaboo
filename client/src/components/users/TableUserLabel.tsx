import { User } from "@/types/user.type";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export interface TableUserLabelProps {
    user?: User;
}

const TableUserLabel = ({ user }: TableUserLabelProps) => {
    return (
        <Link to={`/users/${user?.id}`} className="text-sm bg-gray-100 text-primary px-4 py-2 rounded-md hover:bg-gray-200"><FontAwesomeIcon icon={faUser} /> {user?.phoneNumber?.slice(-10)}</Link>
    )
}

export default TableUserLabel;
