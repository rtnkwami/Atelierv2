import { Request, Response } from "express";
import { IShopService } from "./shop.service.ts";
import { Logger } from "pino";
import { NonExistentShopError } from "error.ts";

export interface IShopController {
    getMyShop: (req: Request, res: Response) => Promise<Response>;
    createProduct: (req: Request, res: Response) => Promise<Response>;
}

type dependencies = {
    shopService: IShopService;
    baseLogger: Logger;
}

export const createShopController = ({ shopService, baseLogger }: dependencies): IShopController => {
    const shopControllerLogger = baseLogger.child({ module: "shops", layer: "controller" });

    return {
        getMyShop: async (req, res) => {
            const sellerId = req.user.uid;
            const result = await shopService.getShopForSeller(sellerId);

            if (result.isErr) {
                if (result.error instanceof NonExistentShopError) { 
                    return res.status(404).json({ message: 'User does not have a shop' }) 
                }
                shopControllerLogger.error(result.error, 'Error getting shop');
                return res.status(500).json({ message: 'Error getting shop' });
            }
            return res.status(200).json(result.value)
        },

        createProduct: async (req, res) => {
            const sellerId = req.user.uid;
            const createProductData = req.body;
            const result = await shopService.createProductForShop(sellerId, createProductData);

            if (result.isErr) {
                shopControllerLogger.error(result.error, 'Error creating product');
                return res.status(500).json({ message: 'Error creating shop' });
            }
            return res.status(201).json(result.value);
        }
    }
} 