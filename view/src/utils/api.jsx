import Axios from "./axios"
import SummaryApi from "../common/SummerAPI"

export const fetchGame = async () => {
    try {
        const res = await Axios({
            url: SummaryApi.getGame.url,
            method: SummaryApi.getGame.method
        });

        return res?.data?.data || [];
    } catch (err) {
        console.warn("fetchGame API error:", err);
        return [];
    }
};

