import { tableActionClassName } from "@/constants/inputs.constants";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faCheckCircle, faCopy } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export interface ReferenceIdInputProps {
  label?: string;
  referenceId?: string;
}

export const ReferenceIdInput = ({ label }: ReferenceIdInputProps) => {
  const [isCopied, setIsCopied] = useState(false);

  return (
    <p className="text-xs sm:text-[12px] text-gray-600 px-2 flex items-center gap-1">
      {label}
      <FontAwesomeIcon
        icon={isCopied ? faCheckCircle : faCopy}
        className="w-4 h-4 cursor-pointer text-[12px]"
        onClick={(e) => {
          e.preventDefault();
          if (!label) return;
          navigator.clipboard.writeText(label);
          toast.success(`${label} copied to clipboard`);
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 2000);
        }}
      />
    </p>
  );
};

export interface ActionButtonProps {
  icon: IconProp;
  route?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  label: string;
  iconClassName?: string;
}

export const ActionButton = ({
  icon,
  route = "#",
  onClick,
  label,
  iconClassName = "text-primary",
}: ActionButtonProps) => {
  return (
    <Link to={route} onClick={onClick} className={tableActionClassName}>
      <FontAwesomeIcon icon={icon} className={iconClassName} />
      {label && label}
    </Link>
  );
};
