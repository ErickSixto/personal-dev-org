/**
 * @description       :
 * @author            : ErickSixto
 * @group             :
 * @last modified on  : 10-05-2022
 * @last modified by  : ErickSixto
 **/
public with sharing class esLookupController {
  //* ---------------------------- VARIABLES ------------------------------------------------//
  private final static Integer MAX_RESULTS = 5;
  //* ---------------------------- UI METHODS ---------------------------------------//
  @AuraEnabled
  public static LookupSearchResult searchWithUniqueField(
    String uniqueField,
    String uniqueFieldValue,
    String objectApiName
  ) {
    if (!isObjectExist(objectApiName)) {
      throw new AuraHandledException('Not a valid SObject');
    }
    String nameField = getNameField(objectApiName);

    String queryTemplate =
      'SELECT Id, ' +
      nameField +
      ' FROM ' +
      objectApiName +
      ' WHERE ' +
      uniqueField +
      ' =:uniqueFieldValue';
    List<SObject> records = Database.query(queryTemplate);
    if (records.size() > 0) {
      return new LookupSearchResult(
        records[0].Id,
        objectApiName,
        '',
        (String) records[0].get(nameField),
        objectApiName
      );
    }
    return null;
  }

  @AuraEnabled(Cacheable=true)
  public static List<LookupSearchResult> search(
    String searchTerm,
    List<String> selectedIds,
    String objectApiName,
    String customNameField
  ) {
    if (!isObjectExist(objectApiName)) {
      throw new AuraHandledException('Not a valid SObject');
    }

    List<LookupSearchResult> results = new List<LookupSearchResult>();
    String nameField = getNameField(objectApiName);

    String wildSearchTerm = '%' + String.escapeSingleQuotes(searchTerm) + '%';
    String queryTemplate;
    Boolean isUsingCustomName = false;
    if (customNameField != null && customNameField.length() > 0) {
      isUsingCustomName = true;
      queryTemplate =
        'SELECT Id, ' +
        nameField +
        ', ' +
        customNameField +
        ' FROM ' +
        objectApiName +
        ' WHERE ' +
        customNameField +
        ' LIKE:wildSearchTerm OR ' +
        nameField +
        ' LIKE:wildSearchTerm ' +
        'ORDER BY ' +
        nameField +
        ' DESC LIMIT :MAX_RESULTS';
    } else {
      queryTemplate =
        'SELECT Id, ' +
        nameField +
        ' FROM ' +
        objectApiName +
        ' WHERE ' +
        nameField +
        ' LIKE:wildSearchTerm ORDER BY ' +
        nameField +
        ' DESC LIMIT :MAX_RESULTS';
    }

    List<SObject> records = Database.query(queryTemplate);
    // Prepare results
    for (SObject record : records) {
      String title;
      String subtitle;
      if (isUsingCustomName) {
        title = (String) record.get(customNameField);
        if (title == null || title.trim().length() == 0) {
          title = (String) record.get(nameField);
        }
        subtitle = (String) record.get(nameField);
        if (subtitle == title) {
          subtitle = objectApiName;
        }
      }
      results.add(
        new LookupSearchResult(record.Id, objectApiName, '', title, subtitle)
      );
    }
    results.sort();
    return results;
  }

  @AuraEnabled(Cacheable=true)
  public static List<LookupSearchResult> getRecentlyViewed(
    String objectApiName
  ) {
    List<LookupSearchResult> results = new List<LookupSearchResult>();
    if (!isObjectExist(objectApiName)) {
      throw new AuraHandledException('Not a valid SObject');
    }
    // Get recently viewed records for the selected Object
    List<RecentlyViewed> recentRecords = [
      SELECT Id, Name
      FROM RecentlyViewed
      WHERE Type = :objectApiName
      ORDER BY LastViewedDate DESC
      LIMIT :MAX_RESULTS
    ];
    // Convert recent records into LookupSearchResult
    for (RecentlyViewed recentRecord : recentRecords) {
      results.add(
        new LookupSearchResult(
          recentRecord.Id,
          objectApiName,
          '',
          recentRecord.Name,
          objectApiName
        )
      );
    }
    return results;
  }

  @AuraEnabled(Cacheable=true)
  public static List<LookupSearchResult> getObjectOptions(String searchTerm) {
    List<LookupSearchResult> results = new List<LookupSearchResult>();
    String wildSearchTerm = '%' + String.escapeSingleQuotes(searchTerm) + '%';
    // Get recently viewed records for the selected Object
    List<EntityDefinition> objectOptions = [
      SELECT Label, QualifiedApiName
      FROM EntityDefinition
      WHERE
        Label LIKE :wildSearchTerm
        AND isQueryable = TRUE
        AND IsRetrieveable = TRUE
        AND IsSearchable = TRUE
        AND IsTriggerable = TRUE
        AND IsApexTriggerable = TRUE
      ORDER BY QualifiedApiName
      LIMIT :MAX_RESULTS
    ];
    // Convert recent records into LookupSearchResult
    for (EntityDefinition objectOption : objectOptions) {
      results.add(
        new LookupSearchResult(
          objectOption.QualifiedApiName,
          objectOption.QualifiedApiName,
          getIconName(objectOption.QualifiedApiName),
          objectOption.Label,
          objectOption.QualifiedApiName
        )
      );
    }
    return results;
  }

  //* ---------------------------- UTILITY METHODS ------------------------------------------//
  private static Boolean isObjectExist(String objectApiName) {
    Type objName = Type.forName(objectApiName);
    if (objName != null) {
      return true;
    }
    return false;
  }

  private static String getNameField(String objectApiName) {
    return [
      SELECT QualifiedApiName
      FROM FieldDefinition
      WHERE
        EntityDefinition.QualifiedApiName = :objectApiName
        AND IsNameField = TRUE
      LIMIT 1
    ]
    .QualifiedApiName;
  }

  private static String getIconName(String sObjectName) {
    String u;
    List<Schema.DescribeTabSetResult> tabSetDesc = Schema.describeTabs();
    List<Schema.DescribeTabResult> tabDesc = new List<Schema.DescribeTabResult>();
    List<Schema.DescribeIconResult> iconDesc = new List<Schema.DescribeIconResult>();

    for (Schema.DescribeTabSetResult tsr : tabSetDesc) {
      tabDesc.addAll(tsr.getTabs());
    }

    for (Schema.DescribeTabResult tr : tabDesc) {
      if (sObjectName == tr.getSobjectName()) {
        if (tr.isCustom() == true) {
          iconDesc.addAll(tr.getIcons());
        } else {
          u = 'standard:' + sObjectName.toLowerCase();
          return u;
        }
      }
    }
    for (Schema.DescribeIconResult ir : iconDesc) {
      if (ir.getContentType() == 'image/svg+xml') {
        u =
          'custom:' +
          ir.getUrl().substringBetween('custom/', '.svg').substringBefore('_');
        break;
      }
    }
    return u;
  }
}
