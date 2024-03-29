/**
 * @description       :
 * @author            : ErickSixto
 * @group             :
 * @last modified on  : 01-19-2023
 * @last modified by  : ErickSixto
 **/
public with sharing class InfinityCurrentLoansController {
  @AuraEnabled(cacheable=true)
  public static List<LoanWrapper> getLoans() {
    try {
      List<LoanWrapper> loans = new List<LoanWrapper>();
      List<OTF__c> otfs = [
        SELECT
          Id,
          Borrower__c,
          Security_Address__c,
          Limit__c,
          Lender__r.Name,
          Rate__c,
          LVR__c,
          Expiry_Date__c
        FROM OTF__c
        LIMIT 25
      ];

      if (otfs.isEmpty()) {
        return null;
      }
      for (OTF__c otf : otfs) {
        LoanWrapper wrapper = new LoanWrapper(otf);
        loans.add(wrapper);
      }
      return loans;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
  @AuraEnabled
  public static OTF__c getLoanByRecordId(Id recordId) {
    try {
      List<LoanWrapper> loans = new List<LoanWrapper>();
      List<OTF__c> otfs = [
        SELECT
          Id,
          Name,
          Limit__c,
          Borrower__c,
          LVR__c,
          Lender__c,
          Lender__r.Name,
          Expiry_Date__c,
          Security_Address__c,
          Asset_Class__c,
          Purchase__c,
          Purchase_Date__c,
          Valuation__c,
          Valuation_Date__c,
          Valuer__c,
          Facility_Type__c,
          Drawn__c,
          Base_Rate__c,
          Margin__c,
          Term_Mnths__c,
          Start_Date__c,
          ICR__c,
          WALE__c
        FROM OTF__c
        WHERE Id = :recordId
      ];

      if (otfs.isEmpty()) {
        return null;
      }

      return otfs[0];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }

  @AuraEnabled
  public static List<ContentDocumentLink> getExistingDocuments(
    String recordId
  ) {
    List<ContentDocumentLink> cdList = [
      SELECT
        Id,
        ContentDocument.Id,
        ContentDocument.LatestPublishedVersion.Title,
        ContentDocument.FileExtension,
        ContentDocument.FileType,
        ContentDocument.LatestPublishedVersion.Id
      FROM ContentDocumentLink
      WHERE LinkedEntityId = :recordId
      ORDER BY ContentDocument.LatestPublishedVersion.CreatedDate DESC
    ];
    if (cdList.size() > 0) {
      return cdList;
    } else {
      return null;
    }
  }

  @AuraEnabled(cacheable=true)
  public static String getLoginURL() {
    String baseURL = System.URL.getSalesforceBaseUrl().toExternalForm();
    User userRecord = [
      SELECT Id, AccountId, ContactId
      FROM User
      WHERE Id = :UserInfo.getUserId()
    ];
    if (userRecord.ContactId != null) {
      baseUrl = getExperienceURL();
    }
    return baseUrl;
  }

  public static String getExperienceURL() {
    String baseUrl = Network.getLoginUrl(Network.getNetworkId());
    if(baseUrl == null) return null;
    baseURL = baseURL.replace('/s/login', '');
    baseURL = baseURL.replace('/s/Login', '');
    baseURL = baseURL.replace('/login', '');
    baseURL = baseURL.replace('/Login', '');
    return baseURL;
  }

  public class LoanWrapper {
    @AuraEnabled
    public String id { get; set; }
    @AuraEnabled
    public String borrower { get; set; }
    @AuraEnabled
    public String securityProperty { get; set; }
    @AuraEnabled
    public Decimal loanAmount { get; set; }
    @AuraEnabled
    public String lender { get; set; }
    @AuraEnabled
    public String interestRate { get; set; }
    @AuraEnabled
    public Decimal currentLVR { get; set; }
    @AuraEnabled
    public Date expiry { get; set; }

    public LoanWrapper(OTF__c otf) {
      this.id = otf.Id;
      this.borrower = otf?.Borrower__c;
      this.securityProperty = otf?.Security_Address__c;
      this.loanAmount = otf?.Limit__c;
      this.lender = otf.Lender__r.Name;
      this.interestRate = otf?.Rate__c;
      this.currentLVR = otf.LVR__c != null ? otf.LVR__c / 100 : null;
      this.expiry = otf?.Expiry_Date__c;
    }
  }
}
