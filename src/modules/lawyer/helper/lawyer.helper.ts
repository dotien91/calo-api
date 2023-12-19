import { Response, Request, response } from "express";
import { ForbiddenException, HttpStatus, NotFoundException, Injectable, BadRequestException } from "@nestjs/common";
import { ExpressRequestDto } from "../../../dto/express-request.dto";
import { CreateLawyerDto } from "../dto/create-lawyer.dto";
import { LawyerService } from "../services/lawyer.service";
import { ListLawyerDto } from "../dto/list-lawyer.dto";
import { PlanService } from "../../../modules/plan/services/plan.service";
import { UserPermissionService } from "../../../modules/user_permission/services/user_permission.service";
import { UpdateLawyerDto } from "../dto/update-lawyer.dto";
import { SubscribeService } from "../../../modules/subscribe/services/subscribe.service";
import { ChatSocketService } from "../../../modules/chat_socket/chat_socket.service";
import { CreateUserFollowLawyerDto } from "../dto/create-user_follow_lawyer.dto";
import * as _ from "lodash";
import { UserFollowLawyerService } from "../services/user_follow_lawyer.service";
import { CreateLawyerRawDto } from "../dto/create.lawyer_raw.dto";
import { LawyerRawService } from "../services/lawyer_rawservice";
import cheerio from "cheerio";
import axios from "axios";
import { ChatMediaService } from "../../../modules/chat_media/services/chat_media.service";
import { LawyerCategoryService } from "../services/lawyer_category.service";
import { CityService } from "../../../modules/city/services/city.service";
/**
 * @author Tony Vu
 * @class UpdateUserHelper
 */
@Injectable()
export class LawyerHelper {
  constructor(
    private lawyerService: LawyerService,
    private userFollowLawyerService: UserFollowLawyerService,
    private userPermissionService: UserPermissionService,
    private lawyerRawService: LawyerRawService,
    private lawyerCategoryService: LawyerCategoryService,
    private chatMediaService: ChatMediaService,
    private cityService: CityService
  ) {
    let self = this;
    setTimeout(() => {
      for (let dataPage = 1; dataPage < 10; dataPage++) {
        // self.handleProcessData(dataPage, 200);
        // self.handleProcessStar(dataPage, 200);
        // self.handleProcessLatLon(dataPage, 200);
        // self.handleProcessLawyer(dataPage);
      }

      // self.handleProcessCategory();
    }, 1000);
  }

  async handleProcessLawyer(page) {
    try {
      let dataLawyer = await this.lawyerService.filter({}, {}, page, 200);
      for (let dataItem of dataLawyer) {
        // console.log(dataItem?.contact, 'dataItem');
        // console.log(dataItem?.avatar)
        let officeNumber = dataItem?.contact[0]?.office_number;
        let website = dataItem?.contact[0]?.website;
        let description = dataItem?.about;
        // console.log(dataItem)
        let pointLawyer = 0;
        if (officeNumber) {
          pointLawyer++;
        }
        if (description) {
          pointLawyer++;
        }
        if (website) {
          pointLawyer++;
        }
        // console.log(dataItem?.avatar?.media_url, 'dataItem?.avatar?.media_url')
        // console.log(dataItem?.avatar?.media_url?.indexOf(".svg"), 'dataItem?.avatar?.media_url?.indexOf(".svg")')
        if (dataItem?.avatar?.media_url?.indexOf(".svg") === -1) {
          pointLawyer++;
        }
        // console.log(pointLawyer, 'pointLawyer++')
        let dataUpdate = {
          points: pointLawyer,
          _id: dataItem?._id?.toString(),
        };
        let dataReturn = await this.lawyerService.update(dataUpdate);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async handleProcessCategory() {
    let data = this.handleGetHtml();
    let self = this;
    let $ = cheerio.load(data);
    let dataCategory = [];
    let dataBigCategory = $(".v-content-wrapper").each(function () {
      let parentCategory = $(this).find("h4 a").text();
      let dataSlug = self.toSlug(parentCategory);

      if (parentCategory) {
        let dataChildItem = [];

        let dataChild = $(this)
          .find(".link-list li a")
          .each(function () {
            let childCategory = $(this).text();
            dataChildItem.push({
              slug: self.toSlug(childCategory),
              name: childCategory,
            });
          });

        let dataToAdd = {
          parent: {
            slug: dataSlug,
            name: parentCategory,
          },
          child: dataChildItem,
        };
        dataCategory.push(dataToAdd);
      }
    });

    console.log(JSON.stringify(dataCategory), "dataCategory");
    for (let dataItem of dataCategory) {
      let dataParent = await this.lawyerCategoryService.create(dataItem.parent);
      for (let childItem of dataItem.child) {
        let dataToAdd = { ...childItem, ...{ parent_id: dataParent?._id?.toString() } };
        await this.lawyerCategoryService.create(dataToAdd);
      }
    }

    // let dataParent = {
    //   slug: dataSlug,
    //   name: parentCategory
    // }
    // console.log(data, 'data');
  }

  handleGetHtml() {
    return `<div class="tab-content u-vertical-padding-2"><div class="tab-pane fade in active" id="areas-of-law" role="tabpanel"><div class="text-columns text-columns-narrower text-columns-max-4"><div class="v-content-wrapper"><h4><a title="Bankruptcy &amp; Debt" href="/bankruptcy-debt-lawyer.html">Bankruptcy and debt</a></h4><ul class="link-list"><li><a title="Chapter 11 Bankruptcy" href="/chapter-11-bankruptcy-lawyer.html">Chapter 11 bankruptcy</a></li><li><a title="Chapter 13 Bankruptcy" href="/chapter-13-bankruptcy-lawyer.html">Chapter 13 bankruptcy</a></li><li><a title="Chapter 7 Bankruptcy" href="/chapter-7-bankruptcy-lawyer.html">Chapter 7 bankruptcy</a></li><li><a title="Credit Repair" href="/credit-repair-lawyer.html">Credit repair</a></li><li><a title="Debt Collection" href="/debt-collection-lawyer.html">Debt collection</a></li><li><a title="Debt Settlement" href="/debt-settlement-lawyer.html">Debt settlement</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Business" href="/business-lawyer.html">Business</a></h4><ul class="link-list"><li><a title="Admiralty &amp; Maritime" href="/admiralty-maritime-lawyer.html">Admiralty and maritime</a></li><li><a title="Advertising" href="/advertising-lawyer.html">Advertising</a></li><li><a title="Agriculture" href="/agriculture-lawyer.html">Agriculture</a></li><li><a title="Antitrust &amp; Trade Law" href="/antitrust-trade-law-lawyer.html">Antitrust and trade law</a></li><li><a title="Aviation" href="/aviation-lawyer.html">Aviation</a></li><li><a title="Banking" href="/banking-lawyer.html">Banking</a></li><li><a title="Communications &amp; Media" href="/communications-media-lawyer.html">Communications and media</a></li><li><a title="Contracts &amp; Agreements" href="/contracts-agreements-lawyer.html">Contracts and agreements</a></li><li><a title="Corporate &amp; Incorporation" href="/corporate-incorporation-lawyer.html">Corporate and incorporation</a></li><li><a title="Debt &amp; Lending Agreements" href="/debt-lending-agreements-lawyer.html">Debt and lending agreements</a></li><li><a title="Employee Benefits" href="/employee-benefits-lawyer.html">Employee benefits</a></li><li><a title="Energy &amp; Utilities" href="/energy-utilities-lawyer.html">Energy and utilities</a></li><li><a title="Entertainment" href="/entertainment-lawyer.html">Entertainment</a></li><li><a title="Equipment Finance and Leasing" href="/equipment-finance-and-leasing-lawyer.html">Equipment finance and leasing</a></li><li><a title="Financial Markets and Services" href="/financial-markets-and-services-lawyer.html">Financial markets and services</a></li><li><a title="Franchising" href="/franchising-lawyer.html">Franchising</a></li><li><a title="Gaming" href="/gaming-lawyer.html">Gaming</a></li><li><a title="Government Contracts" href="/government-contracts-lawyer.html">Government contracts</a></li><li><a title="Health Care" href="/health-care-lawyer.html">Health care</a></li><li><a title="Insurance" href="/insurance-lawyer.html">Insurance</a></li><li><a title="Internet" href="/internet-lawyer.html">Internet</a></li><li><a title="Licensing" href="/licensing-lawyer.html">Licensing</a></li><li><a title="Life Sciences &amp; Biotechnology" href="/life-sciences-biotechnology-lawyer.html">Life sciences and biotechnology</a></li><li><a title="Limited Liability Company (LLC)" href="/limited-liability-company-llc--lawyer.html">Limited liability company (LLC)</a></li><li><a title="Mergers &amp; Acquisitions" href="/mergers-acquisitions-lawyer.html">Mergers and acquisitions</a></li><li><a title="Oil &amp; Gas" href="/oil-gas-lawyer.html">Oil and gas</a></li><li><a title="Partnership" href="/partnership-lawyer.html">Partnership</a></li><li><a title="Project Finance" href="/project-finance-lawyer.html">Project finance</a></li><li><a title="Public Finance &amp; Tax Exempt Finance" href="/public-finance-tax-exempt-finance-lawyer.html">Public finance and tax exempt finance</a></li><li><a title="Securities Offerings" href="/securities-offerings-lawyer.html">Securities offerings</a></li><li><a title="Tax" href="/tax-lawyer.html">Tax</a></li><li><a title="Telecommunications" href="/telecommunications-lawyer.html">Telecommunications</a></li><li><a title="Transportation" href="/transportation-lawyer.html">Transportation</a></li><li><a title="Venture Capital" href="/venture-capital-lawyer.html">Venture capital</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Civil Rights" href="/civil-rights-lawyer.html">Civil rights</a></h4><ul class="link-list"><li><a title="Constitutional" href="/constitutional-lawyer.html">Constitutional</a></li><li><a title="Gun Law" href="/gun-law-lawyer.html">Gun Law</a></li><li><a title="Native Peoples Law" href="/native-peoples-law-lawyer.html">Native peoples law</a></li><li><a title="Privacy" href="/privacy-lawyer.html">Privacy</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Consumer Protection" href="/consumer-protection-lawyer.html">Consumer protection</a></h4><ul class="link-list"><li><a title="Computer Fraud" href="/computer-fraud-lawyer.html">Computer fraud</a></li><li><a title="Credit Card Fraud" href="/credit-card-fraud-lawyer.html">Credit card fraud</a></li><li><a title="Health Insurance" href="/health-insurance-lawyer.html">Health insurance</a></li><li><a title="Identity Theft" href="/identity-theft-lawyer.html">Identity theft</a></li><li><a title="Insurance Fraud" href="/insurance-fraud-lawyer.html">Insurance fraud</a></li><li><a title="Lemon Law" href="/lemon-law-lawyer.html">Lemon law</a></li><li><a title="Life Insurance" href="/life-insurance-lawyer.html">Life insurance</a></li><li><a title="Medicaid &amp; Medicare" href="/medicaid-medicare-lawyer.html">Medicaid and medicare</a></li><li><a title="Securities &amp; Investment Fraud" href="/securities-investment-fraud-lawyer.html">Securities and investment fraud</a></li><li><a title="Tax Fraud &amp; Tax Evasion" href="/tax-fraud-tax-evasion-lawyer.html">Tax fraud and tax evasion</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Criminal Defense" href="/criminal-defense-lawyer.html">Criminal defense</a></h4><ul class="link-list"><li><a title="Cannabis Law" href="/cannabis-law-lawyer.html">Cannabis Law</a></li><li><a title="DUI &amp; DWI" href="/dui-dwi-lawyer.html">DUI and DWI</a></li><li><a title="Drug Crime" href="/drug-crime-lawyer.html">Drug Crime</a></li><li><a title="Expungement" href="/expungement-lawyer.html">Expungement</a></li><li><a title="Federal Crime" href="/federal-crime-lawyer.html">Federal crime</a></li><li><a title="Juvenile" href="/juvenile-lawyer.html">Juvenile law</a></li><li><a title="Sex Crime" href="/sex-crime-lawyer.html">Sex crime</a></li><li><a title="Speeding &amp; Traffic Ticket" href="/speeding-traffic-ticket-lawyer.html">Speeding and traffic ticket</a></li><li><a title="Violent Crime" href="/violent-crime-lawyer.html">Violent crime</a></li><li><a title="White Collar Crime" href="/white-collar-crime-lawyer.html">White collar crime</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Employment &amp; Labor" href="/employment-labor-lawyer.html">Employment and labor</a></h4><ul class="link-list"><li><a title="Discrimination" href="/discrimination-lawyer.html">Discrimination</a></li><li><a title="Sexual Harassment" href="/sexual-harassment-lawyer.html">Sexual harassment</a></li><li><a title="Social Security" href="/social-security-lawyer.html">Social Security &amp; Disability</a></li><li><a title="Workers Compensation" href="/workers-compensation-lawyer.html">Workers compensation</a></li><li><a title="Wrongful Termination" href="/wrongful-termination-lawyer.html">Wrongful termination</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Estate Planning" href="/estate-planning-lawyer.html">Estate planning</a></h4><ul class="link-list"><li><a title="Elder Law" href="/elder-law-lawyer.html">Elder law</a></li><li><a title="Guardianship" href="/guardianship-lawyer.html">Guardianship</a></li><li><a title="Power Of Attorney" href="/power-of-attorney-lawyer.html">Power of attorney</a></li><li><a title="Probate" href="/probate-lawyer.html">Probate</a></li><li><a title="Trusts" href="/trusts-lawyer.html">Trusts</a></li><li><a title="Wills &amp; Living Wills" href="/wills-living-wills-lawyer.html">Wills and living wills</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Family" href="/family-lawyer.html">Family</a></h4><ul class="link-list"><li><a title="Adoption" href="/adoption-lawyer.html">Adoption</a></li><li><a title="Alimony" href="/alimony-lawyer.html">Alimony</a></li><li><a title="Child Abuse" href="/child-abuse-lawyer.html">Child abuse</a></li><li><a title="Child Custody" href="/child-custody-lawyer.html">Child custody</a></li><li><a title="Child Support" href="/child-support-lawyer.html">Child support</a></li><li><a title="Divorce &amp; Separation" href="/divorce-separation-lawyer.html">Divorce and separation</a></li><li><a title="Domestic Violence" href="/domestic-violence-lawyer.html">Domestic violence</a></li><li><a title="LGBT+ Law" href="/lgbt-law-lawyer.html">LGBT+ Law</a></li><li><a title="Marriage &amp; Prenuptials" href="/marriage-prenuptials-lawyer.html">Marriage and prenuptials</a></li><li><a title="Uncontested Divorce" href="/uncontested-divorce-lawyer.html">Uncontested divorce</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Government" href="/government-lawyer.html">Government</a></h4><ul class="link-list"><li><a title="Administrative Law" href="/administrative-law-lawyer.html">Administrative law</a></li><li><a title="Election Campaigns &amp; Political Law" href="/election-campaigns-political-law-lawyer.html">Election campaigns and political law</a></li><li><a title="Federal Regulation" href="/federal-regulation-lawyer.html">Federal regulation</a></li><li><a title="Military Law" href="/military-law-lawyer.html">Military law</a></li><li><a title="State, Local And Municipal Law" href="/state-local-and-municipal-law-lawyer.html">State, local, and municipal law</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Immigration" href="/immigration-lawyer.html">Immigration</a></h4><ul class="link-list"><li><a title="Asylum" href="/asylum-lawyer.html">Asylum</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Intellectual Property" href="/intellectual-property-lawyer.html">Intellectual property</a></h4><ul class="link-list"><li><a title="Copyright Application" href="/copyright-application-lawyer.html">Copyright application</a></li><li><a title="Copyright Infringement" href="/copyright-infringement-lawyer.html">Copyright infringement</a></li><li><a title="Patent Application" href="/patent-application-lawyer.html">Patent application</a></li><li><a title="Patent Infringement" href="/patent-infringement-lawyer.html">Patent infringement</a></li><li><a title="Trademark Application" href="/trademark-application-lawyer.html">Trademark application</a></li><li><a title="Trademark Infringement" href="/trademark-infringement-lawyer.html">Trademark infringement</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Lawsuits &amp; Disputes" href="/lawsuits-disputes-lawyer.html">Lawsuits and disputes</a></h4><ul class="link-list"><li><a title="Appeals" href="/appeals-lawyer.html">Appeals</a></li><li><a title="Arbitration" href="/arbitration-lawyer.html">Arbitration</a></li><li><a title="Class Action" href="/class-action-lawyer.html">Class action</a></li><li><a title="Litigation" href="/litigation-lawyer.html">Litigation</a></li><li><a title="Mediation" href="/mediation-lawyer.html">Mediation</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Personal Injury" href="/personal-injury-lawyer.html">Personal injury</a></h4><ul class="link-list"><li><a title="Animal &amp; Dog Bites" href="/animal-dog-bites-lawyer.html">Animal and dog bites</a></li><li><a title="Birth Injury" href="/birth-injury-lawyer.html">Birth injury</a></li><li><a title="Brain Injury" href="/brain-injury-lawyer.html">Brain injury</a></li><li><a title="Car Accidents" href="/car-accidents-lawyer.html">Car accident</a></li><li><a title="Defective and Dangerous Products" href="/defective-and-dangerous-products-lawyer.html">Defective and dangerous products</a></li><li><a title="Libel &amp; Slander" href="/libel-slander-lawyer.html">Libel and slander</a></li><li><a title="Medical Malpractice" href="/medical-malpractice-lawyer.html">Medical malpractice</a></li><li><a title="Mesothelioma &amp; Asbestos" href="/mesothelioma-asbestos-lawyer.html">Mesothelioma and asbestos</a></li><li><a title="Motorcycle Accident" href="/motorcycle-accident-lawyer.html">Motorcycle accident</a></li><li><a title="Nursing Home Abuse and Neglect" href="/nursing-home-abuse-and-neglect-lawyer.html">Nursing home abuse and neglect</a></li><li><a title="Slip and Fall Accident" href="/slip-and-fall-accident-lawyer.html">Slip and fall accident</a></li><li><a title="Spinal Cord Injury" href="/spinal-cord-injury-lawyer.html">Spinal cord injury</a></li><li><a title="Trucking Accident" href="/trucking-accident-lawyer.html">Trucking accident</a></li><li><a title="Wrongful Death" href="/wrongful-death-lawyer.html">Wrongful death</a></li></ul></div><div class="v-content-wrapper"><h4><a title="Real Estate" href="/real-estate-lawyer.html">Real estate</a></h4><ul class="link-list"><li><a title="Commercial" href="/commercial-lawyer.html">Commercial real estate</a></li><li><a title="Construction &amp; Development" href="/construction-development-lawyer.html">Construction and development</a></li><li><a title="Foreclosure" href="/foreclosure-lawyer.html">Foreclosure</a></li><li><a title="Land Use &amp; Zoning" href="/land-use-zoning-lawyer.html">Land use and zoning</a></li><li><a title="Landlord &amp; Tenant" href="/landlord-tenant-lawyer.html">Landlord or tenant</a></li><li><a title="Residential" href="/residential-lawyer.html">Residential real estate</a></li></ul></div></div></div><div class="tab-pane fade" id="a-z" role="tabpanel"><div class="text-columns text-columns-narrowest text-columns-max-4"><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">A</h3><ul class="link-list u-vertical-padding-half"><li><a title="Administrative Law" href="/administrative-law-lawyer.html">Administrative Law</a></li><li><a title="Admiralty &amp; Maritime" href="/admiralty-maritime-lawyer.html">Admiralty &amp; Maritime</a></li><li><a title="Adoption" href="/adoption-lawyer.html">Adoption</a></li><li><a title="Advertising" href="/advertising-lawyer.html">Advertising</a></li><li><a title="Agriculture" href="/agriculture-lawyer.html">Agriculture</a></li><li><a title="Alimony" href="/alimony-lawyer.html">Alimony</a></li><li><a title="Animal &amp; Dog Bites" href="/animal-dog-bites-lawyer.html">Animal &amp; Dog Bites</a></li><li><a title="Animal Law" href="/animal-law-lawyer.html">Animal Law</a></li><li><a title="Antitrust &amp; Trade Law" href="/antitrust-trade-law-lawyer.html">Antitrust &amp; Trade Law</a></li><li><a title="Appeals" href="/appeals-lawyer.html">Appeals</a></li><li><a title="Arbitration" href="/arbitration-lawyer.html">Arbitration</a></li><li><a title="Asylum" href="/asylum-lawyer.html">Asylum</a></li><li><a title="Aviation" href="/aviation-lawyer.html">Aviation</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">B</h3><ul class="link-list u-vertical-padding-half"><li><a title="Banking" href="/banking-lawyer.html">Banking</a></li><li><a title="Bankruptcy &amp; Debt" href="/bankruptcy-debt-lawyer.html">Bankruptcy &amp; Debt</a></li><li><a title="Birth Injury" href="/birth-injury-lawyer.html">Birth Injury</a></li><li><a title="Brain Injury" href="/brain-injury-lawyer.html">Brain Injury</a></li><li><a title="Business" href="/business-lawyer.html">Business</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">C</h3><ul class="link-list u-vertical-padding-half"><li><a title="Cannabis Law" href="/cannabis-law-lawyer.html">Cannabis Law</a></li><li><a title="Car Accidents" href="/car-accidents-lawyer.html">Car Accidents</a></li><li><a title="Chapter 11 Bankruptcy" href="/chapter-11-bankruptcy-lawyer.html">Chapter 11 Bankruptcy</a></li><li><a title="Chapter 13 Bankruptcy" href="/chapter-13-bankruptcy-lawyer.html">Chapter 13 Bankruptcy</a></li><li><a title="Chapter 7 Bankruptcy" href="/chapter-7-bankruptcy-lawyer.html">Chapter 7 Bankruptcy</a></li><li><a title="Child Abuse" href="/child-abuse-lawyer.html">Child Abuse</a></li><li><a title="Child Custody" href="/child-custody-lawyer.html">Child Custody</a></li><li><a title="Child Support" href="/child-support-lawyer.html">Child Support</a></li><li><a title="Civil Rights" href="/civil-rights-lawyer.html">Civil Rights</a></li><li><a title="Class Action" href="/class-action-lawyer.html">Class Action</a></li><li><a title="Commercial" href="/commercial-lawyer.html">Commercial</a></li><li><a title="Communications &amp; Media" href="/communications-media-lawyer.html">Communications &amp; Media</a></li><li><a title="Computer Fraud" href="/computer-fraud-lawyer.html">Computer Fraud</a></li><li><a title="Constitutional" href="/constitutional-lawyer.html">Constitutional</a></li><li><a title="Construction &amp; Development" href="/construction-development-lawyer.html">Construction &amp; Development</a></li><li><a title="Consumer Protection" href="/consumer-protection-lawyer.html">Consumer Protection</a></li><li><a title="Contracts &amp; Agreements" href="/contracts-agreements-lawyer.html">Contracts &amp; Agreements</a></li><li><a title="Copyright Application" href="/copyright-application-lawyer.html">Copyright Application</a></li><li><a title="Copyright Infringement" href="/copyright-infringement-lawyer.html">Copyright Infringement</a></li><li><a title="Corporate &amp; Incorporation" href="/corporate-incorporation-lawyer.html">Corporate &amp; Incorporation</a></li><li><a title="Credit Card Fraud" href="/credit-card-fraud-lawyer.html">Credit Card Fraud</a></li><li><a title="Credit Repair" href="/credit-repair-lawyer.html">Credit Repair</a></li><li><a title="Criminal Defense" href="/criminal-defense-lawyer.html">Criminal Defense</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">D</h3><ul class="link-list u-vertical-padding-half"><li><a title="DUI &amp; DWI" href="/dui-dwi-lawyer.html">DUI &amp; DWI</a></li><li><a title="Debt &amp; Lending Agreements" href="/debt-lending-agreements-lawyer.html">Debt &amp; Lending Agreements</a></li><li><a title="Debt Collection" href="/debt-collection-lawyer.html">Debt Collection</a></li><li><a title="Debt Settlement" href="/debt-settlement-lawyer.html">Debt Settlement</a></li><li><a title="Defective and Dangerous Products" href="/defective-and-dangerous-products-lawyer.html">Defective and Dangerous Products</a></li><li><a title="Discrimination" href="/discrimination-lawyer.html">Discrimination</a></li><li><a title="Divorce &amp; Separation" href="/divorce-separation-lawyer.html">Divorce &amp; Separation</a></li><li><a title="Domestic Violence" href="/domestic-violence-lawyer.html">Domestic Violence</a></li><li><a title="Drug Crime" href="/drug-crime-lawyer.html">Drug Crime</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">E</h3><ul class="link-list u-vertical-padding-half"><li><a title="Education" href="/education-lawyer.html">Education</a></li><li><a title="Elder Law" href="/elder-law-lawyer.html">Elder Law</a></li><li><a title="Election Campaigns &amp; Political Law" href="/election-campaigns-political-law-lawyer.html">Election Campaigns &amp; Political Law</a></li><li><a title="Employee Benefits" href="/employee-benefits-lawyer.html">Employee Benefits</a></li><li><a title="Employment &amp; Labor" href="/employment-labor-lawyer.html">Employment &amp; Labor</a></li><li><a title="Energy &amp; Utilities" href="/energy-utilities-lawyer.html">Energy &amp; Utilities</a></li><li><a title="Entertainment" href="/entertainment-lawyer.html">Entertainment</a></li><li><a title="Environmental and Natural Resources" href="/environmental-and-natural-resources-lawyer.html">Environmental and Natural Resources</a></li><li><a title="Equipment Finance and Leasing" href="/equipment-finance-and-leasing-lawyer.html">Equipment Finance and Leasing</a></li><li><a title="Estate Planning" href="/estate-planning-lawyer.html">Estate Planning</a></li><li><a title="Ethics &amp; Professional Responsibility" href="/ethics-professional-responsibility-lawyer.html">Ethics &amp; Professional Responsibility</a></li><li><a title="Expungement" href="/expungement-lawyer.html">Expungement</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">F</h3><ul class="link-list u-vertical-padding-half"><li><a title="Family" href="/family-lawyer.html">Family</a></li><li><a title="Federal Crime" href="/federal-crime-lawyer.html">Federal Crime</a></li><li><a title="Federal Regulation" href="/federal-regulation-lawyer.html">Federal Regulation</a></li><li><a title="Financial Markets and Services" href="/financial-markets-and-services-lawyer.html">Financial Markets and Services</a></li><li><a title="Foreclosure" href="/foreclosure-lawyer.html">Foreclosure</a></li><li><a title="Franchising" href="/franchising-lawyer.html">Franchising</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">G</h3><ul class="link-list u-vertical-padding-half"><li><a title="Gaming" href="/gaming-lawyer.html">Gaming</a></li><li><a title="General Practice" href="/general-practice-lawyer.html">General Practice</a></li><li><a title="Government" href="/government-lawyer.html">Government</a></li><li><a title="Government Contracts" href="/government-contracts-lawyer.html">Government Contracts</a></li><li><a title="Guardianship" href="/guardianship-lawyer.html">Guardianship</a></li><li><a title="Gun Law" href="/gun-law-lawyer.html">Gun Law</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">H</h3><ul class="link-list u-vertical-padding-half"><li><a title="Health Care" href="/health-care-lawyer.html">Health Care</a></li><li><a title="Health Insurance" href="/health-insurance-lawyer.html">Health Insurance</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">I</h3><ul class="link-list u-vertical-padding-half"><li><a title="Identity Theft" href="/identity-theft-lawyer.html">Identity Theft</a></li><li><a title="Immigration" href="/immigration-lawyer.html">Immigration</a></li><li><a title="Insurance" href="/insurance-lawyer.html">Insurance</a></li><li><a title="Insurance Fraud" href="/insurance-fraud-lawyer.html">Insurance Fraud</a></li><li><a title="Intellectual Property" href="/intellectual-property-lawyer.html">Intellectual Property</a></li><li><a title="International Law" href="/international-law-lawyer.html">International Law</a></li><li><a title="Internet" href="/internet-lawyer.html">Internet</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">J</h3><ul class="link-list u-vertical-padding-half"><li><a title="Juvenile" href="/juvenile-lawyer.html">Juvenile</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">L</h3><ul class="link-list u-vertical-padding-half"><li><a title="LGBT+ Law" href="/lgbt-law-lawyer.html">LGBT+ Law</a></li><li><a title="Land Use &amp; Zoning" href="/land-use-zoning-lawyer.html">Land Use &amp; Zoning</a></li><li><a title="Landlord &amp; Tenant" href="/landlord-tenant-lawyer.html">Landlord &amp; Tenant</a></li><li><a title="Lawsuits &amp; Disputes" href="/lawsuits-disputes-lawyer.html">Lawsuits &amp; Disputes</a></li><li><a title="Lemon Law" href="/lemon-law-lawyer.html">Lemon Law</a></li><li><a title="Libel &amp; Slander" href="/libel-slander-lawyer.html">Libel &amp; Slander</a></li><li><a title="Licensing" href="/licensing-lawyer.html">Licensing</a></li><li><a title="Life Insurance" href="/life-insurance-lawyer.html">Life Insurance</a></li><li><a title="Life Sciences &amp; Biotechnology" href="/life-sciences-biotechnology-lawyer.html">Life Sciences &amp; Biotechnology</a></li><li><a title="Limited Liability Company (LLC)" href="/limited-liability-company-llc--lawyer.html">Limited Liability Company (LLC)</a></li><li><a title="Litigation" href="/litigation-lawyer.html">Litigation</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">M</h3><ul class="link-list u-vertical-padding-half"><li><a title="Marriage &amp; Prenuptials" href="/marriage-prenuptials-lawyer.html">Marriage &amp; Prenuptials</a></li><li><a title="Mediation" href="/mediation-lawyer.html">Mediation</a></li><li><a title="Medicaid &amp; Medicare" href="/medicaid-medicare-lawyer.html">Medicaid &amp; Medicare</a></li><li><a title="Medical Malpractice" href="/medical-malpractice-lawyer.html">Medical Malpractice</a></li><li><a title="Mergers &amp; Acquisitions" href="/mergers-acquisitions-lawyer.html">Mergers &amp; Acquisitions</a></li><li><a title="Mesothelioma &amp; Asbestos" href="/mesothelioma-asbestos-lawyer.html">Mesothelioma &amp; Asbestos</a></li><li><a title="Military Law" href="/military-law-lawyer.html">Military Law</a></li><li><a title="Motorcycle Accident" href="/motorcycle-accident-lawyer.html">Motorcycle Accident</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">N</h3><ul class="link-list u-vertical-padding-half"><li><a title="Native Peoples Law" href="/native-peoples-law-lawyer.html">Native Peoples Law</a></li><li><a title="Nursing Home Abuse and Neglect" href="/nursing-home-abuse-and-neglect-lawyer.html">Nursing Home Abuse and Neglect</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">O</h3><ul class="link-list u-vertical-padding-half"><li><a title="Oil &amp; Gas" href="/oil-gas-lawyer.html">Oil &amp; Gas</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">P</h3><ul class="link-list u-vertical-padding-half"><li><a title="Partnership" href="/partnership-lawyer.html">Partnership</a></li><li><a title="Patent Application" href="/patent-application-lawyer.html">Patent Application</a></li><li><a title="Patent Infringement" href="/patent-infringement-lawyer.html">Patent Infringement</a></li><li><a title="Personal Injury" href="/personal-injury-lawyer.html">Personal Injury</a></li><li><a title="Power Of Attorney" href="/power-of-attorney-lawyer.html">Power Of Attorney</a></li><li><a title="Privacy" href="/privacy-lawyer.html">Privacy</a></li><li><a title="Probate" href="/probate-lawyer.html">Probate</a></li><li><a title="Project Finance" href="/project-finance-lawyer.html">Project Finance</a></li><li><a title="Public Finance &amp; Tax Exempt Finance" href="/public-finance-tax-exempt-finance-lawyer.html">Public Finance &amp; Tax Exempt Finance</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">R</h3><ul class="link-list u-vertical-padding-half"><li><a title="Real Estate" href="/real-estate-lawyer.html">Real Estate</a></li><li><a title="Residential" href="/residential-lawyer.html">Residential</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">S</h3><ul class="link-list u-vertical-padding-half"><li><a title="Securities &amp; Investment Fraud" href="/securities-investment-fraud-lawyer.html">Securities &amp; Investment Fraud</a></li><li><a title="Securities Offerings" href="/securities-offerings-lawyer.html">Securities Offerings</a></li><li><a title="Sex Crime" href="/sex-crime-lawyer.html">Sex Crime</a></li><li><a title="Sexual Harassment" href="/sexual-harassment-lawyer.html">Sexual Harassment</a></li><li><a title="Slip and Fall Accident" href="/slip-and-fall-accident-lawyer.html">Slip and Fall Accident</a></li><li><a title="Social Security" href="/social-security-lawyer.html">Social Security</a></li><li><a title="Speeding &amp; Traffic Ticket" href="/speeding-traffic-ticket-lawyer.html">Speeding &amp; Traffic Ticket</a></li><li><a title="Spinal Cord Injury" href="/spinal-cord-injury-lawyer.html">Spinal Cord Injury</a></li><li><a title="State, Local And Municipal Law" href="/state-local-and-municipal-law-lawyer.html">State, Local And Municipal Law</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">T</h3><ul class="link-list u-vertical-padding-half"><li><a title="Tax" href="/tax-lawyer.html">Tax</a></li><li><a title="Tax Fraud &amp; Tax Evasion" href="/tax-fraud-tax-evasion-lawyer.html">Tax Fraud &amp; Tax Evasion</a></li><li><a title="Telecommunications" href="/telecommunications-lawyer.html">Telecommunications</a></li><li><a title="Trademark Application" href="/trademark-application-lawyer.html">Trademark Application</a></li><li><a title="Trademark Infringement" href="/trademark-infringement-lawyer.html">Trademark Infringement</a></li><li><a title="Transportation" href="/transportation-lawyer.html">Transportation</a></li><li><a title="Trucking Accident" href="/trucking-accident-lawyer.html">Trucking Accident</a></li><li><a title="Trusts" href="/trusts-lawyer.html">Trusts</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">U</h3><ul class="link-list u-vertical-padding-half"><li><a title="Uncontested Divorce" href="/uncontested-divorce-lawyer.html">Uncontested Divorce</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">V</h3><ul class="link-list u-vertical-padding-half"><li><a title="Venture Capital" href="/venture-capital-lawyer.html">Venture Capital</a></li><li><a title="Violent Crime" href="/violent-crime-lawyer.html">Violent Crime</a></li></ul></div><div class="v-content-wrapper"><h3 class="u-vertical-margin-0">W</h3><ul class="link-list u-vertical-padding-half"><li><a title="White Collar Crime" href="/white-collar-crime-lawyer.html">White Collar Crime</a></li><li><a title="Wills &amp; Living Wills" href="/wills-living-wills-lawyer.html">Wills &amp; Living Wills</a></li><li><a title="Workers Compensation" href="/workers-compensation-lawyer.html">Workers Compensation</a></li><li><a title="Wrongful Death" href="/wrongful-death-lawyer.html">Wrongful Death</a></li><li><a title="Wrongful Termination" href="/wrongful-termination-lawyer.html">Wrongful Termination</a></li></ul></div></div></div></div>`;
  }

  async handleProcessLatLon(page, limit) {
    try {
      let dataUpdate = await this.lawyerService.filter({}, {}, page, limit);

      for (let dataItem of dataUpdate) {
        if (!dataItem?.loc) {
          console.log(dataItem?.name);
        }
        //   let dataLatLon = dataItem?.maps?.coordinates;
        //   console.log(dataItem?.maps?.coordinates)
        //   let latitude = dataLatLon[1];
        //   let longitude = dataLatLon[0];
        //   // let dataToUpdateLaw = {
        //   //   loc: dataItem.maps,
        //   //   _id: dataItem?._id?.toString()
        //   // }
        //   console.log(dataToUpdateLaw, 'dataToUpdate');

        //   // let dataToAdd = {
        //   //   star_number: countNumber,
        //   //   star_value: dataNumber,
        //   // };

        //   // let dataToUpdateLaw = {
        //   //   _id: dataItem?._id?.toString(),
        //   //   data_star: dataToUpdate,
        //   // };
        //   await this.lawyerService.update(dataToUpdateLaw, {maps: ""});
      }
    } catch (error) {
      console.log(error);
    }
  }

  async handleProcessData(page, limit) {
    try {
      let dataRaw = await this.lawyerRawService.filter({}, {}, page, limit);
      for (let itemRaw of dataRaw) {
        let urlLawRaw = itemRaw.url;
        let lawObject = await this.lawyerService.findOne({ ref_url: urlLawRaw });
        if (lawObject) {
          continue;
        }
        console.log(itemRaw.url);
        let $ = cheerio.load(itemRaw.data?.toString());
        // console.log($.html());
        let lawyerPosition = $(".profile-header .lawyer-position p").text();
        let lawyerName = $(".profile-header .lawyer-name span").text();
        let aboutBio = $("#bioExpandCollapse").text();
        let profileMap = $("#profile-map").attr("data-map");

        let dataSubTitle = $(".lawyer-info.profile-card .alias-info.small").text();

        try {
          var dataLatLon = [];
          var dataMap = JSON.parse(profileMap);
          if (dataMap[0]) {
            dataLatLon = [dataMap[0]?.latlong[1], dataMap[0]?.latlong[0]];
          }
          console.log(JSON.parse(profileMap));
        } catch (error) {}

        let dataContact = [];

        let trackingContainerDetail = "";

        let dataContactObject = $(".gtm-tracking-container.contact-items.overridable-lawyer-phone .contact-item").each(
          function () {
            let dataToAddContact = {};
            let trackingContainerHeader = $(this).find(".contact-item-header").text();

            dataToAddContact = { ...dataToAddContact, ...{ name: trackingContainerHeader.trim() } };
            trackingContainerDetail = $(this).find(".contact-address").text();

            dataToAddContact = { ...dataToAddContact, ...{ address: trackingContainerDetail.trim() } };

            let trackingContainerPhoneOffice = $(this).find(".overridable-lawyer-phone-copy").text();

            let trackingContainerPhoneFax = $(this)
              .find("[data-pp=phone_call_initiated]")
              .each(function () {
                let dataItem = $(this).text();

                console.log(dataItem, "dataItem");
                if (dataItem.indexOf("Office") !== -1) {
                  console.log(dataItem, "Office");
                  dataToAddContact = {
                    ...dataToAddContact,
                    ...{ office_number: dataItem.trim()?.replace(" Office", "") },
                  };
                }
                if (dataItem.indexOf("Fax") !== -1) {
                  console.log(dataItem, "Fax");
                  dataToAddContact = { ...dataToAddContact, ...{ fax_number: dataItem.trim()?.replace(" Fax", "") } };
                }
              });
            let trackingWebsite = $(".contact-website.ga-click-website").text();
            let website = trackingWebsite.trim() ? "https://" + trackingWebsite.trim() : "";
            dataToAddContact = { ...dataToAddContact, ...{ website: website } };
            dataContact.push(dataToAddContact);
          }
        );

        var workExperience = [];
        var education = [];
        var associations = [];
        var publications = [];
        var engagements = [];
        var honors = [];
        var legalCase = [];
        var languageSpoken = [];
        let resumeSection = $(".resume-section").each(function () {
          // console.log($(this).find("h2").html());
          let dataTitle = $(this).find("h2").html();
          // console.log($(this).html(), 'data');
          switch (dataTitle) {
            case "Work Experience":
              // console.log($(this).html());
              $(this)
                .find(".unstyled-list")
                .each(function () {
                  let dataToAdd = {};
                  let resumeSectionTitle = $(this).find(".resume-section-title").text();
                  dataToAdd = { ...dataToAdd, ...{ title: resumeSectionTitle.trim() } };
                  let countText = 0;
                  let resumeSectionDescription = $(this)
                    .find("li")
                    .each(function () {
                      if (countText > 0) {
                        if (countText == 1) {
                          dataToAdd = { ...dataToAdd, ...{ description: $(this).text().trim() } };
                        }
                        if (countText == 2) {
                          dataToAdd = { ...dataToAdd, ...{ text_time: $(this).text().trim() } };
                        }
                      }
                      countText++;
                    });

                  workExperience.push(dataToAdd);
                });
              break;
            case "Education":
              $(this)
                .find(".unstyled-list")
                .each(function () {
                  let dataToAdd = {};
                  let resumeSectionTitle = $(this).find(".resume-section-title").text();
                  dataToAdd = { ...dataToAdd, ...{ title: resumeSectionTitle.trim() } };
                  let countText = 0;
                  let resumeSectionDescription = $(this)
                    .find("li")
                    .each(function () {
                      if (countText > 0) {
                        if (countText == 1) {
                          dataToAdd = { ...dataToAdd, ...{ description: $(this).text().trim() } };
                        }
                        if (countText == 2) {
                          dataToAdd = { ...dataToAdd, ...{ text_time: $(this).text().trim() } };
                        }
                      }
                      countText++;
                    });

                  education.push(dataToAdd);
                });
              break;
            case "Associations":
              $(this)
                .find(".unstyled-list")
                .each(function () {
                  let dataToAdd = {};
                  let resumeSectionTitle = $(this).find(".resume-section-title").text();
                  dataToAdd = { ...dataToAdd, ...{ title: resumeSectionTitle.trim() } };
                  let countText = 0;
                  let resumeSectionDescription = $(this)
                    .find("li")
                    .each(function () {
                      if (countText > 0) {
                        if (countText == 1) {
                          dataToAdd = { ...dataToAdd, ...{ description: $(this).text().trim() } };
                        }
                        if (countText == 2) {
                          dataToAdd = { ...dataToAdd, ...{ text_time: $(this).text().trim() } };
                        }
                      }
                      countText++;
                    });

                  associations.push(dataToAdd);
                });
              break;
              break;
            case "Languages Spoken":
              $(this)
                .find(".unstyled-list")
                .each(function () {
                  let dataToAdd = {};
                  let resumeSectionTitle = $(this).text();
                  dataToAdd = { ...dataToAdd, ...{ title: resumeSectionTitle.trim() } };
                  languageSpoken.push(dataToAdd);
                });
              break;
            case "Speaking Engagements":
              $(this)
                .find(".unstyled-list")
                .each(function () {
                  let dataToAdd = {};
                  let resumeSectionTitle = $(this).find(".resume-section-title").text();
                  dataToAdd = { ...dataToAdd, ...{ title: resumeSectionTitle.trim() } };
                  let countText = 0;
                  let resumeSectionDescription = $(this)
                    .find("li")
                    .each(function () {
                      if (countText > 0) {
                        if (countText == 1) {
                          dataToAdd = { ...dataToAdd, ...{ description: $(this).text().trim() } };
                        }
                        if (countText == 2) {
                          dataToAdd = { ...dataToAdd, ...{ text_time: $(this).text().trim() } };
                        }
                      }
                      countText++;
                    });

                  engagements.push(dataToAdd);
                });
              break;
            case "Publications":
              $(this)
                .find(".unstyled-list")
                .each(function () {
                  let dataToAdd = {};
                  let resumeSectionTitle = $(this).find(".resume-section-title").text();
                  dataToAdd = { ...dataToAdd, ...{ title: resumeSectionTitle.trim() } };
                  let countText = 0;
                  let resumeSectionDescription = $(this)
                    .find("li")
                    .each(function () {
                      if (countText > 0) {
                        if (countText == 1) {
                          dataToAdd = { ...dataToAdd, ...{ description: $(this).text().trim() } };
                        }
                        if (countText == 2) {
                          dataToAdd = { ...dataToAdd, ...{ text_time: $(this).text().trim() } };
                        }
                      }
                      countText++;
                    });

                  publications.push(dataToAdd);
                });
              break;
              break;

            case "Legal Cases":
              $(this)
                .find(".unstyled-list")
                .each(function () {
                  let dataToAdd = {};
                  let resumeSectionTitle = $(this).find(".resume-section-title").text();
                  dataToAdd = { ...dataToAdd, ...{ title: resumeSectionTitle.trim() } };
                  let countText = 0;
                  let resumeSectionDescription = $(this)
                    .find("li")
                    .each(function () {
                      if (countText > 0) {
                        if (countText == 1) {
                          dataToAdd = { ...dataToAdd, ...{ description: $(this).text().trim() } };
                        }
                        if (countText == 2) {
                          dataToAdd = { ...dataToAdd, ...{ text_time: $(this).text().trim() } };
                        }
                      }
                      countText++;
                    });

                  legalCase.push(dataToAdd);
                });
              break;
            case "Honors and Awards":
              $(this)
                .find(".unstyled-list")
                .each(function () {
                  let dataToAdd = {};
                  let resumeSectionTitle = $(this).find(".resume-section-title").text();
                  dataToAdd = { ...dataToAdd, ...{ title: resumeSectionTitle.trim() } };
                  let countText = 0;
                  let resumeSectionDescription = $(this)
                    .find("li")
                    .each(function () {
                      if (countText > 0) {
                        if (countText == 1) {
                          dataToAdd = { ...dataToAdd, ...{ description: $(this).text().trim() } };
                        }
                        if (countText == 2) {
                          dataToAdd = { ...dataToAdd, ...{ text_time: $(this).text().trim() } };
                        }
                      }
                      countText++;
                    });

                  honors.push(dataToAdd);
                });
              break;
          }
        });

        let licenseCard = $(".license-card");
        let licenseYear = 3000;

        let licenseTitle = licenseCard.find(".section main-title").text();
        // console.log(licenseTitle);
        // console.log(trackingWebsite);
        let profilePayload = $("#profile-payload").attr("data-payload");
        // console.log(profilePayload);

        let dataLicenses = [];
        let licensesSection = $(".licenses-section .license-card").each(function () {
          let title = $(this).find(".main-title").text();
          let dataPush = {
            licensed_year: title?.replace("\n", "")?.trim(),
          };

          // console.log(title);
          let countContent = 0;
          let contentLicenses = $(this)
            .find(".content span")
            .each(function () {
              if (countContent == 0) {
                dataPush = { ...dataPush, ...{ status: $(this).text() } };
              }
              if (countContent == 1) {
                dataPush = { ...dataPush, ...{ note: $(this).text() } };
              }
              countContent++;
            });
          // console.log(contentLicenses);

          let countSection = 0;
          let sectionArray = $(this)
            .find(".section")
            .each(function () {
              if (countSection > 0 && countSection < 3) {
                // console.log($(this).text());
                let dataTextSpan = $(this).text();
                if (dataTextSpan.indexOf("State") !== -1) {
                  let countSpan = 0;
                  let dataSpan = $(this)
                    .find("span")
                    .each(function () {
                      if (countSpan == 1) {
                        dataPush = { ...dataPush, ...{ state: $(this).text()?.replace("\n", "")?.trim() } };
                      }
                      countSpan++;
                    });
                }

                if (dataTextSpan.indexOf("Acquired") !== -1) {
                  let countSpan = 0;
                  let dataSpan = $(this)
                    .find("span")
                    .each(function () {
                      if (countSpan == 1) {
                        dataPush = { ...dataPush, ...{ acquired: $(this).text()?.replace("\n", "")?.trim() } };

                        let yearNumber = parseInt($(this).text()?.replace("\n", "")?.trim());
                        if (yearNumber < licenseYear && yearNumber > 0) {
                          licenseYear = yearNumber;
                        }
                      }
                      countSpan++;
                    });
                }
              }
              countSection++;
            });

          console.log(dataPush, "dataPush");
          dataLicenses.push(dataPush);
        });

        let avatar = $("#stickyNavHeader img").attr("src");

        let dataAvatar = await this.createMedia(avatar, "image");

        let self = this;
        let dataArray = [];
        let publicAlbum = [];
        let dataImageCrawl = $("#photos-and-videos .media-thumbnail").each(function async() {
          let dataImage = $(this).attr("src");
          dataArray.push(dataImage);
        });
        for (let itemArray of dataArray) {
          let dataImageObject = await self.createMedia(itemArray, "image");
          publicAlbum.push(dataImageObject?._id?.toString());
        }
        let extraInfo = $(".extra-info .header-free-consultation").text().trim();
        let extraVirtual = $(".extra-info .header-virtual-consultation").text().trim();
        console.log(avatar);
        let url = encodeURI(avatar);

        let reviewNumber = $(".text-muted.reviews-link").text().trim();
        console.log(parseInt(reviewNumber), "reviewNumber");
        let reviewValue = $(".rating-value").text();

        console.log(parseFloat(reviewValue), "parseFloat(reviewValue)");
        console.log(lawyerPosition, "lawyerPosition");

        let paymentMethod = $(".profile-card .payment-methods span").text();
        let paymentMethodArray = [];
        let dataPaymentMethodArray = [];
        if (paymentMethod) {
          paymentMethodArray = paymentMethod.split(",");
          for (let dataPayment of paymentMethodArray) {
            dataPaymentMethodArray.push(dataPayment.trim());
          }
        }
        let costData = {};
        let dataCost = $(".profile-card .unstyled-list li").each(function () {
          let dataText = $(this).text();
          if (dataText?.indexOf("Free Consultation") !== -1) {
            costData = { ...costData, ...{ free_consultation: $(this).find(".price-label").text().trim() } };
          }
          if (dataText?.indexOf("Contingency") !== -1) {
            costData = { ...costData, ...{ contingency: $(this).find(".price-label").text().trim() } };
          }
          if (dataText?.indexOf("Retainer") !== -1) {
            costData = { ...costData, ...{ retainer: $(this).find(".price-label").text().trim() } };
          }
          if (dataText?.indexOf("Hourly Rates") !== -1) {
            costData = { ...costData, ...{ hourly_rates: $(this).find(".price-label").text().trim() } };
          }
        });

        let awardArrayImage = [];
        let award = $(".badges-container .profile-badge").each(function () {
          let dataDescription = $(this).attr("data-description");
          if (dataDescription?.indexOf("The Avvo") === -1) {
            let imageAward = $(this).attr("data-img");
            awardArrayImage.push(imageAward);
          }
        });
        let dataIdAward = [];
        for (let dataImageAward of awardArrayImage) {
          let dataObject = await this.createMedia(dataImageAward, "image");
          dataIdAward.push(dataObject?._id?.toString());
        }

        let dataCategory = [];

        let categoryObject = $(".chart-legend-list.unstyled-list li").each(function () {
          let textCategory = $(this).find("a").text().replace("... Read more", "");

          let categoryDetail = $(this).find("em").text();
          let categoryPercent = $(this).find(".chart-legend-percent").text();

          textCategory = textCategory.replace(categoryPercent, "").replace(/(\n)/g, "");

          let categoryYear = $(this).find("p").text();
          let categoryYearInt = parseInt(categoryYear) ? parseInt(categoryYear) : 0;
          let categoryPercentInt = parseInt(categoryPercent) ? parseInt(categoryPercent) : 0;
          let dataAddCategory = {
            slug: self.toSlug(textCategory),
            name: textCategory,
            detail: categoryDetail,
            year: categoryYear.replace(/(\n)/g, ""),
            percent: categoryPercentInt?.toString(),
          };
          console.log(dataAddCategory, "dataAddCategory");
          dataCategory.push(dataAddCategory);
        });

        let dataCategoryArray = [];
        let categoryDataNewArray = [];
        for (let itemCategory of dataCategory) {
          let idCategoryObject = await this.lawyerCategoryService.findOne({ slug: itemCategory.slug });
          let dataToAddCategory = itemCategory;
          if (idCategoryObject) {
            dataToAddCategory = { ...dataToAddCategory, ...{ ref_id: idCategoryObject?._id?.toString() } };
            dataCategoryArray.push(idCategoryObject?._id);
          }

          categoryDataNewArray.push(dataToAddCategory);
        }
        let subAbout = $(".about-tagline span").text().trim();

        let dataCity = $(".widget-location.icon-map-marker-before-orange").text();
        let state = "";
        let cityId = null;
        let city = "";
        if (dataCity) {
          let dataChildCity = dataCity?.split(",");
          city = dataChildCity[0];
          state = dataChildCity[1].trim();
          let dataCityObject = await this.cityService.findOne({ city_name: city.trim() });
          if (dataCityObject) {
            cityId = dataCityObject?._id;
          }
        }
        let dataCreate: any = {
          review_number: parseInt(reviewNumber) ? parseInt(reviewNumber) : 0,
          review_value: parseFloat(reviewValue) ? parseFloat(reviewValue) : 0,
          name: lawyerName,
          state_name: state,
          city_name: city.trim(),
          city: cityId,
          categories: dataCategoryArray,
          position: lawyerPosition.trim()?.replace("\n", " "),
          sub_name: dataSubTitle,
          contact: dataContact,
          category_data: categoryDataNewArray,
          payment_method: dataPaymentMethodArray,
          sub_about: subAbout,
          license_year: licenseYear,
          address: {
            text: trackingContainerDetail.trim(),
            zip_code: null,
            city: null,
          },
          awards: dataIdAward,
          avatar: dataAvatar?._id,
          licensed: dataLicenses,
          cost: costData,
          about: aboutBio?.trim()?.replace("\n", ""),
          ref_url: itemRaw.url,
          map_data: dataMap,
          maps: {
            type: "Point",
            coordinates: dataLatLon,
          },
          work_experience: workExperience,
          education: education,
          legal_case: legalCase,
          associations: associations,
          honors: honors,
          publications: publications,
          engagements: engagements,
          language_spoken: languageSpoken,
          is_free_consultation: extraInfo ? true : false,
          is_extra_virtual: extraVirtual ? true : false,
          public_album: publicAlbum,
        };

        await this.lawyerService.create(dataCreate);

        console.log(dataCreate, "dataCreate");
      }
    } catch (error) {
      console.log(error);
    }
  }

  async handleProcessStar(page, limit) {
    try {
      let dataUpdate = await this.lawyerService.filter({}, {}, page, limit);
      for (let dataItem of dataUpdate) {
        let dataRaw = {
          url: dataItem.ref_url,
        };
        console.log(dataItem.ref_url, "dataRawHtml");
        let dataRawHtml = await this.lawyerRawService.findOne(dataRaw);
        // console.log(dataRawHtml.data, 'eieieieieieie');
        let $ = cheerio.load(dataRawHtml.data?.toString());

        let totalRating = Number(dataItem.review_number);
        console.log(totalRating, "totalRating");
        let countNumber = 5;
        let dataToUpdate = [];
        let dataObject = $(".review-overall-ratings .histogram-rating-percent").each(function () {
          // let dataStar = $(this).find(".histogram-rating-percent");
          console.log($(this).text(), "$(this).text()");
          let dataText = parseInt($(this).text());
          console.log(dataText, "dataText");
          let percentText = dataText / 100;
          let dataNumber = Math.round(totalRating * percentText);
          let dataToAdd = {
            star_number: countNumber,
            star_value: dataNumber,
          };
          dataToUpdate.push(dataToAdd);
          countNumber--;
        });
        console.log(dataToUpdate);

        let dataToUpdateLaw = {
          _id: dataItem?._id?.toString(),
          data_star: dataToUpdate,
        };
        await this.lawyerService.update(dataToUpdateLaw);
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   *
   * @param str
   * @returns
   */
  toSlug(str: string) {
    str = str.toLowerCase();
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, "a");
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, "e");
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, "i");
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, "o");
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, "u");
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, "y");
    str = str.replace(/(đ)/g, "d");
    str = str.replace(/([^0-9a-z-\s])/g, "");
    str = str.replace(/(\s+)/g, "-");
    str = str.replace(/^-+/g, "");
    str = str.replace(/-+$/g, "");
    let date = new Date().getTime();
    return str;
  }

  /**
   *
   * @param url
   * @returns
   */
  async createMedia(url: string, type) {
    let dataMedia = {
      media_url: url,
      media_url_presign: "",
      media_type: type,
      media_thumbnail: "",
      media_content: "",
      media_square: "",
      media_mime_type: "image/png",
      media_file_name: url,
      media_status: 0,
      gender: "",
      sexual_content: 0,
      data_ai: "",
      media_meta: [],
      createBy: "642a49eb18acaeada350130e",
    };
    let dataAvatar = await this.chatMediaService.create(dataMedia);
    return dataAvatar;
  }
  /**
   * @author Tony Vu
   * @param id
   * @param createUserPermission
   * @param res
   * @param req
   * @returns
   */
  async createNewLawyer(createLawyerData: CreateLawyerDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      if (await this.userPermissionService.isHavePermission(userId, "lawyer/list")) {
        if (this.validateJson(createLawyerData?.address)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              address: JSON.parse(createLawyerData?.address),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              address: null,
            },
          };
        }

        if (this.validateJson(createLawyerData?.licensed)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              licensed: JSON.parse(createLawyerData?.licensed),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              licensed: [],
            },
          };
        }

        if (this.validateJson(createLawyerData?.categories)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              categories: JSON.parse(createLawyerData?.categories),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              categories: [],
            },
          };
        }

        if (this.validateJson(createLawyerData?.maps)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              maps: JSON.parse(createLawyerData?.maps),
            },
          };
        }

        if (this.validateJson(createLawyerData?.work_experience)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              work_experience: JSON.parse(createLawyerData?.work_experience),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              work_experience: null,
            },
          };
        }

        if (this.validateJson(createLawyerData?.education)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              education: JSON.parse(createLawyerData?.education),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              education: null,
            },
          };
        }

        if (this.validateJson(createLawyerData?.legal_case)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              legal_case: JSON.parse(createLawyerData?.legal_case),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              legal_case: null,
            },
          };
        }

        if (this.validateJson(createLawyerData?.associations)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              associations: JSON.parse(createLawyerData?.associations),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              associations: null,
            },
          };
        }

        if (this.validateJson(createLawyerData?.contact)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              contact: JSON.parse(createLawyerData?.contact),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              contact: [],
            },
          };
        }

        if (this.validateJson(createLawyerData?.contact)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              contact: JSON.parse(createLawyerData?.contact),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              contact: [],
            },
          };
        }

        if (this.validateJson(createLawyerData?.language_spoken)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              language_spoken: JSON.parse(createLawyerData?.language_spoken),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              language_spoken: [],
            },
          };
        }

        if (this.validateJson(createLawyerData?.honors_awards)) {
          createLawyerData = {
            ...createLawyerData,
            ...{
              honors_awards: JSON.parse(createLawyerData?.honors_awards),
            },
          };
        } else {
          createLawyerData = {
            ...createLawyerData,
            ...{
              honors_awards: [],
            },
          };
        }

        let dataCreate = await this.lawyerService.create(createLawyerData);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataCreate);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getLawyerListByAdmin(query: ListLawyerDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};
      if (query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }
      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let dataReturn = await this.lawyerService.filter(dataToFilter, orderByOBject, page, limit);
      let dataCount = await this.lawyerService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count", "X-Total-Count": dataCount })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param query
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async getLawyerListByUser(query: ListLawyerDto, res: Response, req: ExpressRequestDto) {
    try {
      if (Number(query.limit) > 1000) {
        query.limit = 1000;
      }
      let dataUser = await this.handleSession(req);
      // console.log(dataUser, "dataUser");

      if (dataUser?.data_country) {
        let dataCountry = JSON.parse(dataUser?.data_country);
        let dataLatLong = dataCountry?.loc?.split(",");
        let lat = parseFloat(dataLatLong[0]);
        let lon = parseFloat(dataLatLong[1]);
        console.log(dataCountry);
        query = { ...query, ...{ latitude: lat, longitude: lon } };
      }

      let limit = query.limit ? query.limit : 1000;
      let page = query.page ? query.page : 1;
      let orderByOBject = {};

      if (query.order_by && (query.order_type == "most_reviewed" || !query?.order_by)) {
        orderByOBject = { ...orderByOBject, ...{ review_number: query.order_by } };
      }

      if (query.order_by && query.order_type == "client_rating") {
        orderByOBject = { ...orderByOBject, ...{ review_value: query.order_by } };
      }

      if (query.order_by && query.order_type == "experience") {
        orderByOBject = { ...orderByOBject, ...{ license_year: query.order_by } };
      }

      if (query.order_by && !query?.order_type) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: query.order_by } };
      }

      if (!query.order_by) {
        orderByOBject = { ...orderByOBject, ...{ createdAt: "ASC" } };
      }

      let dataToFilter = { ...query };
      delete dataToFilter.page;
      delete dataToFilter.limit;
      delete dataToFilter.order_by;
      let projection = {
        avatar: 1,
        name: 1,
        about: 1,
        is_extra_virtual: 1,
        is_open_for_business: 1,
        position: 1,
        review_number: 1,
        review_value: 1,
        licensed: 1,
        contact: 1,
        map_data: 1,
        ref_url: 1,
        points: 1,
      };
      let dataReturn = await this.lawyerService.filter(dataToFilter, orderByOBject, page, limit, projection);
      // let dataCount = await this.lawyerService.count(dataToFilter);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   *
   * @param res
   */
  async handleSession(req: ExpressRequestDto) {
    try {
      let authCodeHeader = req?.headers;
      let authCodeString: string = "";
      if (authCodeHeader && authCodeHeader["x-authorization"]) {
        authCodeString = authCodeHeader["x-authorization"]?.toString();
      }
      if (authCodeHeader && authCodeHeader["authorization"]) {
        authCodeString = authCodeHeader["authorization"].replace("Bearer ", "");
      }

      try {
        let config = {
          headers: {
            "X-Authorization": authCodeString,
          },
        };
        let dataUser = await axios
          .post(process.env.LAW_URL + "/user/anonymous/get-data", {}, config)
          .then((response) => {
            return response.data;
          })
          .catch((error) => {
            return null;
          });
        return dataUser;
      } catch (error) {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleGetDetailLawyer(id: string, res: Response, req: ExpressRequestDto) {
    try {
      //Check Permission
      let dataReturn = await this.lawyerService.findById(id.toString());
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   *
   * @param str
   * @returns
   */
  validateJson(str: string) {
    try {
      let dataJson = JSON.parse(str);
      if (dataJson?.length === 0) {
        return false;
      } else {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  /**
   *
   * @param dataCreate
   * @param res
   * @param req
   * @returns
   */
  async createLawyerRaw(dataCreate: CreateLawyerRawDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "lawyer/update")) {
        //Check Data
        let dataFinder = {
          url: dataCreate?.url,
        };
        let objectFind = await this.lawyerRawService.findOne(dataFinder);
        if (objectFind) {
          let dataUpdate = { ...dataCreate, ...{ _id: objectFind?._id?.toString() } };
          let dataReturn = await this.lawyerRawService.update(dataUpdate);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataReturn);
        } else {
          let dataReturn = await this.lawyerRawService.create(dataCreate);
          return res
            .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
            .status(HttpStatus.OK)
            .json(dataReturn);
        }
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param id
   * @param res
   * @param req
   * @returns
   */
  async handleUpdateLawyerByAdmin(dataUpdate: UpdateLawyerDto, res: Response, req: ExpressRequestDto) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let userId = userObject._id.toString();
      //Check Permission
      if (await this.userPermissionService.isHavePermission(userId, "lawyer/update")) {
        if (this.validateJson(dataUpdate?.address)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              address: JSON.parse(dataUpdate?.address),
            },
          };
        }

        if (this.validateJson(dataUpdate?.licensed)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              licensed: JSON.parse(dataUpdate?.licensed),
            },
          };
        }

        if (this.validateJson(dataUpdate?.categories)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              categories: JSON.parse(dataUpdate?.categories),
            },
          };
        }

        if (this.validateJson(dataUpdate?.maps)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              maps: JSON.parse(dataUpdate?.maps),
            },
          };
        }

        if (this.validateJson(dataUpdate?.work_experience)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              work_experience: JSON.parse(dataUpdate?.work_experience),
            },
          };
        }

        if (this.validateJson(dataUpdate?.education)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              education: JSON.parse(dataUpdate?.education),
            },
          };
        }

        if (this.validateJson(dataUpdate?.legal_case)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              legal_case: JSON.parse(dataUpdate?.legal_case),
            },
          };
        }

        if (this.validateJson(dataUpdate?.associations)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              associations: JSON.parse(dataUpdate?.associations),
            },
          };
        }

        if (this.validateJson(dataUpdate?.contact)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              contact: JSON.parse(dataUpdate?.contact),
            },
          };
        }

        if (this.validateJson(dataUpdate?.contact)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              contact: JSON.parse(dataUpdate?.contact),
            },
          };
        }

        if (this.validateJson(dataUpdate?.language_spoken)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              language_spoken: JSON.parse(dataUpdate?.language_spoken),
            },
          };
        }

        if (this.validateJson(dataUpdate?.honors_awards)) {
          dataUpdate = {
            ...dataUpdate,
            ...{
              honors_awards: JSON.parse(dataUpdate?.honors_awards),
            },
          };
        }

        let dataReturn = await this.lawyerService.update(dataUpdate);
        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processFollowUser(dataFollow: CreateUserFollowLawyerDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }
      let dataUpdate = {
        user_id: userObject._id.toString(),
        lawyer_id: dataFollow.lawyer_id.toString(),
      };
      await this.lawyerService.handleUpdateInc(dataFollow.lawyer_id.toString(), true);
      //Count Like
      let dataReturn = await this.userFollowLawyerService.update(dataUpdate);
      return res
        .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
        .status(HttpStatus.OK)
        .json(dataReturn);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  /**
   * @author Tony Vu
   * @param dataFollow
   * @param req
   * @param res
   * @returns
   */
  async processUnFollowUser(dataFollow: CreateUserFollowLawyerDto, req: ExpressRequestDto, res: Response) {
    try {
      let userObject = req?.user_object;
      if (!userObject) {
        throw new ForbiddenException("User is invalid");
      }

      let dataFindOne = {
        user_id: userObject._id.toString(),
        lawyer_id: dataFollow.lawyer_id.toString(),
      };
      let dataToCheck = await this.userFollowLawyerService.findOne(dataFindOne);

      if (dataToCheck) {
        let dataReturn = await this.userFollowLawyerService.remove(dataToCheck._id.toString());
        await this.lawyerService.handleUpdateInc(dataFollow.lawyer_id.toString(), false);

        return res
          .set({ "Access-Control-Expose-Headers": "X-Authorization, X-Total-Count" })
          .status(HttpStatus.OK)
          .json(dataReturn);
      } else {
        throw new BadRequestException("You haven't permission for this Action!");
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
