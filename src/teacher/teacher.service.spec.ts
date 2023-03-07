import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from 'src/entities/company';
import { Teacher } from 'src/entities/teacher';
import { User } from 'src/entities/user';
import { WorkShop } from 'src/entities/workshop';
import { Repository } from 'typeorm';
import { TeacherService } from './teacher.service';

const mockteacherRepository = () =>({
  insert : jest.fn(),
})
const mockcompanyRepository = () =>({
  insert : jest.fn(),
})
const mockworkshopRepository = () =>({
  find : jest.fn(),
})
const mockuserRepository = () =>({
  find : jest.fn(),
})


type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('TeacherService', () => {
  let service: TeacherService;
  let companyRepository: MockRepository<Company>;
  let teacherRepository: MockRepository<Teacher>;
  let workshopRepository: MockRepository<WorkShop>;
  let userRepository: MockRepository<User>;


  beforeEach( async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherService,
        {
        provide: getRepositoryToken(Teacher), // key: WorkShop entitiy를 가지는 레포지토리 토큰 발급
        useValue: mockteacherRepository(),
       },      
       {
        provide: getRepositoryToken(Company), // key: WorkShop entitiy를 가지는 레포지토리 토큰 발급
        useValue: mockcompanyRepository(),
       },   
       {
        provide: getRepositoryToken(WorkShop), // key: WorkShop entitiy를 가지는 레포지토리 토큰 발급
        useValue: mockworkshopRepository(),
       },   
       {
        provide: getRepositoryToken(User), // key: WorkShop entitiy를 가지는 레포지토리 토큰 발급
        useValue: mockuserRepository(),
       },   
      ],
    }).compile();

    service = module.get<TeacherService>(TeacherService);
    teacherRepository = module.get<MockRepository<Teacher>>(
      getRepositoryToken(Teacher),
    );
    companyRepository = module.get<MockRepository<Company>>(
      getRepositoryToken(Company),
    );
    workshopRepository = module.get<MockRepository<WorkShop>>(
      getRepositoryToken(WorkShop),
    );
    userRepository = module.get<MockRepository<User>>(
      getRepositoryToken(User),
    );
  });
// company 테스트코듬 
  describe('createTeacherCompany', () => {
    it('should insert a new company and return a success message', async () => {
      // Given
      const companyData = {
        company_type: 1,
        company_name: 'Test Company',
        business_number: 1234567890,
        rrn_front: 123,
        rrn_back: 45,
        bank_name: 'Test Bank',
        account: 1234567890,
        saving_name: 'Test Account',
        isBan: 1,
        user_id: 1,
      };
      const expectedMessage = { message: '등록이 완료되었습니다.' };
      
      // When
      const result = await service.createTeacherCompany(
        companyData.company_type,
        companyData.company_name,
        companyData.business_number,
        companyData.rrn_front,
        companyData.rrn_back,
        companyData.bank_name,
        companyData.account,
        companyData.saving_name,
        companyData.isBan,
        companyData.user_id,
      );

      // Then
      expect(companyRepository.insert).toHaveBeenCalledWith(companyData);
      expect(result).toEqual(expectedMessage);
    });

    it('should return an error message when insert throws an error', async () => {
      // Given
      const companyData = {
        company_type: 1,
        company_name: 'Test Company',
        business_number: 1234567890,
        rrn_front: 123,
        rrn_back: 45,
        bank_name: 'Test Bank',
        account: 1234567890,
        saving_name: 'Test Account',
        isBan: 1,
        user_id: 1,
      };
      const errorMessage = 'Error inserting company data.';
      (companyRepository.insert as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));
      const expectedMessage = { errorMessage: '입력한 요청이 잘못되었습니다.' };

      // When
      const result = await service.createTeacherCompany(
        companyData.company_type,
        companyData.company_name,
        companyData.business_number,
        companyData.rrn_front,
        companyData.rrn_back,
        companyData.bank_name,
        companyData.account,
        companyData.saving_name,
        companyData.isBan,
        companyData.user_id,
      );

      // Then
      expect(companyRepository.insert).toHaveBeenCalledWith(companyData);
      expect(result).toEqual(expectedMessage);
    });
  });
});