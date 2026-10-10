// lib/toCartItem.ts
import { ProductOption } from "@/app/brand/[id]";
import { CartItem } from "../store/cartStore";

export function toCartItem(
  item: Pick<
    CartItem,
    | "id"
    | "foodicsId"
    | "foodicsSandBoxId"
    | "name"
    | "price"
    | "img"
    | "desc"
    | "groupName"
  >,
  pickedOptions?: ProductOption[],
): Omit<CartItem, "quantity" | "lineId"> {
  return {
    id: item.id,
    name: item.name,
    foodicsId: item.foodicsId,
    foodicsSandBoxId: item.foodicsSandBoxId,
    price: item.price,
    img: item.img,
    desc: item.desc,
    groupName: item.groupName,
    options: (pickedOptions ?? []).map((o) => ({ ...o, quantity: 1 })),
  };
}
