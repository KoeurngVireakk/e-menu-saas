import { useState } from "react";
import { Link } from "react-router-dom";
import logoSvg from "../../assets/brand/menudigi-logo.svg";
import iconPng from "../../assets/brand/menudigi-icon.png";

const sizeClasses = {
  sm: {
    image: "h-8",
    icon: "h-8 w-8",
    text: "text-xl",
  },
  md: {
    image: "h-10",
    icon: "h-10 w-10",
    text: "text-2xl",
  },
  lg: {
    image: "h-12",
    icon: "h-12 w-12",
    text: "text-3xl",
  },
};

export default function AppLogo({
  size = "md",
  iconOnly = false,
  to = "/admin",
  className = "",
  ariaLabel = "Go to dashboard",
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const classes = sizeClasses[size] || sizeClasses.md;
  const logoClassName = `inline-flex shrink-0 items-center gap-2 transition hover:opacity-90 ${className}`;
  const content = (
    <span className={logoClassName}>
      {!imageFailed ? (
        <img
          src={iconOnly ? iconPng : logoSvg}
          alt="MenuDIGI Logo"
          className={`${iconOnly ? classes.icon : classes.image} shrink-0 object-contain`}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <FallbackLogo classes={classes} iconOnly={iconOnly} />
      )}
    </span>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} aria-label={ariaLabel} className={`${logoClassName} rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`}>
      <span className="inline-flex items-center gap-2">
        {!imageFailed ? (
          <img
            src={iconOnly ? iconPng : logoSvg}
            alt="MenuDIGI Logo"
            className={`${iconOnly ? classes.icon : classes.image} shrink-0 object-contain`}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <FallbackLogo classes={classes} iconOnly={iconOnly} />
        )}
      </span>
    </Link>
  );
}

function FallbackLogo({ classes, iconOnly }) {
  if (iconOnly) {
    return (
      <span className={`${classes.icon} grid shrink-0 place-items-center rounded-md bg-slate-900 text-sm font-extrabold text-blue-400`}>
        MD
      </span>
    );
  }

  return (
    <span className={`${classes.text} font-extrabold tracking-tight`}>
      <span className="text-slate-900">Menu</span>
      <span className="text-blue-600">DIGI</span>
    </span>
  );
}
