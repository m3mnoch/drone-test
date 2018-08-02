import { createElement } from "metaverse-api";

const Ground = (props: JSX.BaseEntity) => {
    return <box id="ground" position={{ x: 25, y: 0, z: 25 }} scale={{ x: 49.9, y: 0.001, z: 49.9 }} color="#228B22" />;
};

export default Ground;
