import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Review } from 'src/entities/review';
import { WishList } from 'src/entities/wish-list';
import { WorkShop } from 'src/entities/workshop';
import { WorkShopInstanceDetail } from 'src/entities/workshop-instance.detail';
import { Repository } from 'typeorm';
import { OrderWorkshopDto } from './dtos/order-workshop.dto';

@Injectable()
export class WorkshopsService {
  constructor(
    @InjectRepository(WorkShop)
    private readonly workshopRepository: Repository<WorkShop>,
    @InjectRepository(WishList)
    private readonly wishRepository: Repository<WishList>,
    @InjectRepository(WorkShopInstanceDetail)
    private readonly workshopDetailRepository: Repository<WorkShopInstanceDetail>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly configService: ConfigService,
  ) {}

  // 인기 워크샵 조회 API
  getBestWorkshops() {}

  // 신규 워크샵 조회 API
  // 전체 워크샵 중에서 createdAt이 가장 최근인 순(=내림차순)으로 정렬한 후 최대 8개를 가져온다.
  async getNewWorkshops() {
    return await this.workshopRepository.find({
      order: { createdAt: 'DESC' },
      take: 8,
    });
  }

  // 워크샵 상세 조회 API
  // id에 해당하는 워크샵 정보만 가져온다.
  async getWorkshopDetail(workshop_id: number) {
    const queryBuilder = await this.workshopRepository
      .createQueryBuilder('workshop')
      .leftJoinAndSelect('workshop.WishList', 'wish')
      .leftJoinAndSelect('workshop.Reviews', 'review') // workshop - GenreTag 테이블 조인
      .innerJoinAndSelect('workshop.GenreTag', 'genre_tag') // workshop - GenreTag 테이블 조인
      .innerJoinAndSelect('workshop.PurposeList', 'purpose') // 조인한 결과에 PuposeList 테이블 조인
      .innerJoinAndSelect('purpose.PurPoseTag', 'purposeTag') // 조인한 결과에 PurPoseTag 테이블 조인

      .select([
        'workshop.id',
        'workshop.title',
        'workshop.category',
        'workshop.desc',
        'workshop.thumb',
        'workshop.min_member',
        'workshop.max_member',
        'workshop.total_time',
        'workshop.price',
        'workshop.location',
        'wish.workshop_id',
        'workshop.thumb',
        'GROUP_CONCAT(wish.user_id) as wish_user_id',
        'GROUP_CONCAT(review.star) as star',
        'GROUP_CONCAT(purposeTag.name) as purpose',
        'GROUP_CONCAT(genre_tag.name) as genre',
        'workshop.updatedAt',
        'workshop.deletedAt',
      ])

      .where('workshop.id = :id', { id: workshop_id })
      .groupBy('workshop.id')
      .getRawMany();

    // , 기준으로 나누고 purpose_name 값 중복 제거
    // star == null 일 때 예외 처리가 필요함
    const result = queryBuilder.map((workshop) => {
      const starArray = workshop.star ? workshop.star.split(',') : []; // star가 null일 경우 빈 배열로 초기화
      const starHalfIndex = Math.floor(starArray.length / 2);
      const halfStars = starArray.slice(0, starHalfIndex); // 중복 값이 나오므로 배열 길이의 반만큼 잘라줘야 함
      const averageStar =
        halfStars.reduce((acc, cur) => acc + parseFloat(cur), 0) /
          halfStars.length || 0; // 평균 계산하기

      // wish_user_id == null 일 때 예외 처리가 필요함
      const wishArray = workshop.wish_user_id
        ? workshop.wish_user_id.split(',')
        : []; // star가 null일 경우 빈 배열로 초기화
      const wishHalfIndex = Math.floor(wishArray.length / 2);
      const halfWish = wishArray.slice(0, wishHalfIndex); // 중복 값이 나오므로 배열 길이의 반만큼 잘라줘야 함

      // s3 + cloud front에서 이미지 가져오기
      const thumbName = workshop.workshop_thumb;
      const cloundFrontUrl = this.configService.get('AWS_CLOUD_FRONT_DOMAIN');
      const thumbUrl = `${cloundFrontUrl}/${thumbName}`;
      // ex) images/workshop/1/eraser-class-thumb.jpg 와 같은 파일명으로 저장되어 있음

      return {
        ...workshop,
        wish_user_id: Array.from(new Set(halfWish)).map((el) => Number(el)),
        star: starArray.length ? starArray : ['0.0'], // star가 빈 문자열인 경우 '0.0'으로 초기화
        purpose: Array.from(new Set(workshop.purpose.split(','))),
        genre: Array.from(new Set(workshop.genre.split(','))),
        averageStar: averageStar.toFixed(1), // 소수점 첫째자리에서 반올림
        workshop_thumb: thumbUrl,
      };
    });

    return result;
  }

  // 워크샵 찜 or 취소하기 API
  // wishList 엔티티에서 workshop_id와 user_id 찾은 후
  // 만약 값이 있으면 찜 해제
  // 없으면 user_id와 workshop_id insert
  async addToWish(user_id: number, workshop_id: number) {
    const IsWish = await this.wishRepository.findOne({
      where: { user_id, workshop_id },
    });
    if (IsWish === null) {
      await this.wishRepository.insert({ user_id, workshop_id });
      return '찜하기 성공!';
    }
    await this.wishRepository.delete({ user_id, workshop_id }); // 찜 해제
    return '찜하기 취소!';
  }

  // 워크샵 상세 정보를 가져올 때 로그인 한 유저가 있다면, 해당 유저가 워크샵을 찜 했는지 안했는지 여부를 확인
  async checkingWish(user_id: number, workshop_id: number) {
    const wishCheck = await this.wishRepository.findOne({
      where: { user_id, workshop_id },
    });
    if (!wishCheck) {
      return false;
    }
    return true;
  }

  // 특정 워크샵 후기 불러오기 API
  async getWorkshopReviews(workshop_id: number) {
    const reviews = await this.reviewRepository.find({
      relations: ['ReviewImages'],
      where: { workshop_id, deletedAt: null },
    });

    const result = reviews.map((review) => {
      // 입력받은 날짜 문자열을 Date 객체로 파싱
      const inputDate = new Date(review.createdAt);

      // (yyyy-mm-dd) 날짜 형식으로 변환
      const year = inputDate.getFullYear();
      const month = String(inputDate.getMonth() + 1).padStart(2, '0');
      const day = String(inputDate.getDate()).padStart(2, '0');
      const outputDate = `${year}-${month}-${day}`;

      // s3 + cloud front에서 이미지 가져오기
      const reviewImageArr = reviews[0].ReviewImages[0];
      const reviewImage = reviewImageArr.img_name;
      const cloundFrontUrl = this.configService.get('AWS_CLOUD_FRONT_DOMAIN');
      const thumbUrl = `${cloundFrontUrl}/${reviewImage}`;
      // ex) images/reviews/1/eraser-class-thumb.jpg 와 같은 파일명으로 저장되어 있음

      return { ...review, createdAt: outputDate, reviewImage: thumbUrl };
    });
    return result;
  }

  // 워크샵 신청하기 API
  async orderWorkshop(
    workshop_id: number,
    user_id: number,
    orderWorkshopDto: OrderWorkshopDto,
  ) {
    const {
      company,
      name,
      email,
      phone_number,
      member_cnt,
      wish_date,
      category,
      purpose,
      wish_location,
      etc,
    } = orderWorkshopDto;
    await this.workshopDetailRepository.insert({
      user_id,
      workshop_id,
      company,
      name,
      email,
      phone_number,
      member_cnt,
      wish_date,
      category,
      purpose,
      wish_location,
      etc,
    });
    return { message: '워크샵 문의 신청이 완료되었습니다.' };
  }
}
