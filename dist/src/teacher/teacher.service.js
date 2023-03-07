"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const company_1 = require("../entities/company");
const teacher_1 = require("../entities/teacher");
const user_1 = require("../entities/user");
const workshop_1 = require("../entities/workshop");
const typeorm_2 = require("typeorm");
let TeacherService = class TeacherService {
    constructor(teacherRepository, userRepository, companyRepository, workshopRepository) {
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.companyRepository = companyRepository;
        this.workshopRepository = workshopRepository;
    }
    async createTeacherRegister(id, phone_number, address, name) {
        try {
            const user_id = await this.userRepository.findOne({
                where: { id },
                select: ['id'],
            });
            await this.teacherRepository.insert({
                user_id: user_id.id,
                phone_number,
                address,
                name,
            });
            return { message: '등록이 완료되었습니다.' };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadRequestException('입력된 요청이 잘못되었습니다.');
        }
    }
    async getTeacherWorkshops() {
        try {
            const workshop = await this.workshopRepository.find({
                where: { deletedAt: null },
                select: ['title', 'thumb', 'genre_id'],
            });
            return workshop;
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadRequestException('입력된 요청이 잘못되었습니다.');
        }
    }
    async getTeacherMypage() {
        try {
            const mypage = await this.teacherRepository.find({
                where: { deletedAt: null },
                select: ['phone_number', 'address', 'name', 'possession_company_id'],
            });
            await this.companyRepository.find({
                where: { deletedAt: null },
                select: [
                    'company_type',
                    'company_name',
                    'business_number',
                    'rrn_front',
                    'rrn_back',
                    'bank_name',
                    'saving_name',
                ],
            });
            return mypage;
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadRequestException('입력된 요청이 잘못되었습니다.');
        }
    }
    async createTeacherCompany(company_type, company_name, business_number, rrn_front, rrn_back, bank_name, account, saving_name, isBan, user_id) {
        try {
            const Company_name = await this.companyRepository.findOne({
                where: { company_name },
            });
            if (Company_name) {
                throw new common_1.BadRequestException('이미 등록된 워크샵입니다.');
            }
            await this.companyRepository.insert({
                company_type,
                company_name,
                business_number,
                rrn_front,
                rrn_back,
                bank_name,
                account,
                saving_name,
                isBan,
                user_id,
            });
            return { message: '등록이 완료되었습니다.' };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadRequestException('입력된 요청이 잘못되었습니다.');
        }
    }
    async createTeacherWorkshops(category, genre_id, title, desc, thumb, min_member, max_member, total_time, price, location) {
        try {
            await this.workshopRepository.insert({
                category,
                genre_id,
                title,
                desc,
                thumb,
                min_member,
                max_member,
                total_time,
                price,
                status: "request",
                location,
            });
            return { message: '워크샵 등록 신청이 완료되었습니다. 관리자의 수락을 기다려 주세요' };
        }
        catch (error) {
            console.log(error);
            throw new common_1.BadRequestException('입력된 요청이 잘못되었습니다.');
        }
    }
    getTeacherRequest() { }
    getTeacherComplete() { }
    updateTeacherAccept() { }
    updateTeacherComplete() { }
};
TeacherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(teacher_1.Teacher)),
    __param(1, (0, typeorm_1.InjectRepository)(user_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(company_1.Company)),
    __param(3, (0, typeorm_1.InjectRepository)(workshop_1.WorkShop)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], TeacherService);
exports.TeacherService = TeacherService;
//# sourceMappingURL=teacher.service.js.map