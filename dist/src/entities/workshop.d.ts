import { GenreTag } from './genre-tag';
import { Order } from './order';
import { Review } from './review';
import { User } from './user';
import { WishList } from './wish-list';
import { WorkShopImage } from './workshop-image';
import { WorkShopInstanceDetail } from './workshop-instance.detail';
import { WorkShopPurpose } from './workshop-purpose';
export declare class WorkShop {
    id: number;
    title: string;
    category: 'online' | 'offline';
    desc: string;
    thumb: string;
    min_member: number;
    max_member: number;
    total_time: number;
    price: number;
    status: 'request' | 'approval' | 'rejected' | 'finished';
    location: string | null;
    user_id: number | null;
    genre_id: number | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    Owner: User;
    WorkShopInstances: WorkShopInstanceDetail[];
    Reviews: Review[];
    Orders: Order[];
    Images: WorkShopImage[];
    WishList: WishList[];
    GenreTag: GenreTag;
    PurposeList: WorkShopPurpose[];
}
