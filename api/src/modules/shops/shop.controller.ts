import { Request, Response } from "express";
import { IShopService } from "./shop.service.ts";
import { Logger } from "pino";
import { NonExistentShopError, NotFoundError } from "error.ts";

export interface IShopController {
    getAShop: (req: Request<{ id: string }>, res: Response) => Promise<Response>;
    getMyShop: (req: Request, res: Response) => Promise<Response>;
    updateMyShopInfo: (req: Request, res: Response) => Promise<Response>;
    createProduct: (req: Request, res: Response) => Promise<Response>;
}

type dependencies = {
    shopService: IShopService;
    baseLogger: Logger;
}

export const createShopController = ({ shopService, baseLogger }: dependencies): IShopController => {
    const shopControllerLogger = baseLogger.child({ module: "shops", layer: "controller" });

    return {
        getAShop: async (req, res) => {
            const shopId = req.params.id;
            const result = await shopService.getAShop(shopId);
            
            return result.match({
                Ok: (shop) => res.status(200).json(shop),
                Err: (reason) => {
                    if (reason instanceof NotFoundError) {
                        return res.status(404).json({ error: reason.message }) 
                    }
                    return res.status(500).json({ error: 'Error getting shop' });
                }
            })
        },
        
        getMyShop: async (req, res) => {
            const sellerId = req.user.uid;
            const result = await shopService.getShopForSeller(sellerId);

            return result.match({
                Ok: (shop) => res.status(200).json(shop),
                Err: (reason) => {
                    if (reason instanceof NonExistentShopError) {
                        return res.status(404).json({ message: 'User does not have a shop' }) 
                    }
                    shopControllerLogger.error(reason, 'Error getting shop');
                    return res.status(500).json({ message: 'Error getting shop' });
                }
            })
        },

        updateMyShopInfo: async (req, res) => {
            const sellerId = req.user.uid;
            const shopUpdateData = req.body;
            const result = await shopService.updateShopInfo(sellerId, shopUpdateData);

            return result.match({
                Ok: (updatedShop) => res.status(200).json(updatedShop),
                Err: (reason) => {
                    shopControllerLogger.error(reason, 'Error updating shop');
                    return res.status(500).json({ message: 'Error updating shop' });
                }
            });
        },

        createProduct: async (req, res) => {
            const sellerId = req.user.uid;
            const data = req.body;
            const result = await shopService.createProductForShop(sellerId, data);

            return result.match({
                Ok: (shopProduct) => res.status(201).json(shopProduct),
                Err: (reason) => {
                    shopControllerLogger.error(reason, 'Error creating product');
                    return res.status(500).json({ message: 'Error creating shop' });
                } 
            });
        }
    }
} 