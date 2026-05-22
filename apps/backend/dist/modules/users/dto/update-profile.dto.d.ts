declare const GENDER_VALUES: readonly ["male", "female", "other", "prefer_not_to_say"];
declare const RELATIONSHIP_STATUS_VALUES: readonly ["single", "in_relationship", "engaged", "married", "complicated", "prefer_not_to_say"];
export declare class UpdateProfileDto {
    name?: string;
    gender?: (typeof GENDER_VALUES)[number];
    dob?: string;
    mobileNumber?: string;
    relationshipStatus?: (typeof RELATIONSHIP_STATUS_VALUES)[number];
}
export {};
