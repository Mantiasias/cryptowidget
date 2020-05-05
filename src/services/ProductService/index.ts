import {API_URL} from "../../config";
import {ProductResponse} from "./types";

class ProductService {
    getProducts(): Promise<ProductResponse> {
        return fetch(API_URL)
            .then(res => {
                return res.json()
            })
    }
}

export default ProductService;
