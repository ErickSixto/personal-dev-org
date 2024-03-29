/**
 * @description       :
 * @author            : ErickSixto
 * @group             :
 * @last modified on  : 09-30-2022
 * @last modified by  : ErickSixto
 **/
public virtual class LookupSearchResult implements Comparable {
  protected String id;
  protected String sObjectType;
  protected String icon;
  protected String title;
  protected String subtitle;
  protected LookupSearchResult() {
  }

  public LookupSearchResult(
    String id,
    String sObjectType,
    String icon,
    String title,
    String subtitle
  ) {
    this.id = id;
    this.sObjectType = sObjectType;
    this.icon = icon;
    this.title = title;
    this.subtitle = subtitle;
  }

  @AuraEnabled
  public String getId() {
    return id;
  }

  @AuraEnabled
  public String getSObjectType() {
    return sObjectType;
  }

  @AuraEnabled
  public String getIcon() {
    return icon;
  }

  @AuraEnabled
  public String getTitle() {
    return title;
  }

  @AuraEnabled
  public String getSubtitle() {
    return subtitle;
  }

  /**
   * Allow to sort search results based on title
   */
  public Integer compareTo(Object compareTo) {
    LookupSearchResult other = (LookupSearchResult) compareTo;
    if (this.getTitle() == null) {
      return (other.getTitle() == null) ? 0 : 1;
    }
    if (other.getTitle() == null) {
      return -1;
    }
    return this.getTitle().compareTo(other.getTitle());
  }
}
