import Axios from "./axios"
import SummaryApi from "../common/SummerAPI"

export const fetchGame = async () => {
    const res = await Axios({
        url: SummaryApi.getGame.url,
        method: SummaryApi.getGame.method
    });

    console.log(res?.data?.data);
    return res?.data?.data;
};

