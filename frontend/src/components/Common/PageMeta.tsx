import { FC } from "react";
import { Helmet } from "react-helmet-async";
import { PageMetaType } from "@/types/common/pageMeta.types";

export const PageMeta: FC<PageMetaType> = ({ title, description }) => {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
        </Helmet>
    );
}


