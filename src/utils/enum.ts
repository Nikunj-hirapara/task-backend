export enum UserData {
    USERNAME = 1,
    EMAIL = 2,
    MOBILE = 3,
    GOOGLE_ID = 4,
    FACEBOOK_ID = 5,
    APPLE_ID = 6,
}

export enum PolicyTypes {
    TERMS = 1,
    PRIVACY = 2,
    DISCLAIMER = 3
}

export enum IndustryType {
    GENERAL = 0,
    TRANSPORT = 1,
    EDUCATION = 2
}

export enum JobStatus {
    OPEN = 1,
    APPLYING = 2,
    ASSIGNED = 3,
    ACCEPT_BY_SEEKER = 4,
    ACCEPT_BY_PROVIDER = 5,

    REJECT_BY_SEEKER = 6,
    REJECT_BY_PROVIDER = 7,

    CANCEL_BY_SEEKER = 8,
    CANCEL_BY_PROVIDER = 9,

    COMPLETED = 10,
    REWORK = 11,
    EXPIRED = 12,
    HIRING = 13,
    CANCELLED = 14,
    ACTIVE = 15,
}

export enum DisputeStatus {
    DISPUTE_BY_SEEKER = 1,
    DISPUTE_BY_PROVIDER = 2,

    APPROVED_BY_ADMIN = 3,
    REJECT_BY_ADMIN = 4,

    REWORK = 5,
    COMPLETED = 6,
    CANCELLED = 7,
}

export enum JobFrom {
    JOB_SEEKER = 1,
    JOB_PROVIDER = 2,
    JOB_ADMIN = 3,
}

export enum JobCancelType {
    ENTIRE_JOB = 1,
    INDIVIDUAL = 2,
}

export enum ApplicationAction {
    ACCEPT = 1,
    REJECT = 2,
}

export enum WalletTransactionType {
    ADD_MONEY = 1,
    SEND_MONEY = 2,
    WITHDRAW_MONEY = 3,
    TRANSFER_MONEY = 4,
    CREATE_JOB = 5,
    COMPLETED_JOB = 6,
    CANCEL_JOB = 7
}

export enum Device {
    ANDROID = 1,
    IOS = 2,
    WEB = 3,
}

export enum UserType {
    SEEKER = 1,
    PROVIDER = 2,
}

export enum AdminRole {
    SUPER_ADMIN = 40001,
    MAINTANANCE_ADMIN = 10001,
    DISPUTE_ADMIN = 80001,
    WALLET_ADMIN = 60001,
    JOB_ADMIN = 70001,
}

export enum ProviderType {
    COMPANY = 1,
    INDIVIDUAL = 2,
}

export enum Gender {
    MALE = 1,
    FEMALE = 2,
}

export enum WalletStatus {
    ACTIVE = 1,
    DEACTIVE = 2,
}

export enum msgType {
    TEXT = 1,
    IMAGE = 2,
    AUDIO = 3,
    VIDEO = 4,
    LOCATION = 5,
    DOCUMENT = 6,
}

export enum UserStoryPrivacyEnum {
    MY_CONTACTS = 1,
    SHARE_ONLY_WITH = 2,
    MY_CONTACTS_EXCEPT = 3,
}

export enum ReadRecipientEnum {
    ON = 1,
    OFF = 2,
}

export enum MessageStatusEnum {
    PENDING = 0,
    SENT = 1,
    DELIVERED = 2,
    READ = 3,
    FAILED = 4,
}

export enum SenderType {
    SEEKER = 1,
    PROVIDER = 2,
    ADMIN = 3,
}

export enum NotificationType {
    MONEY_TRANSFER = 9,

    SEEKR_ACTION_ON_APPLICATON = 10,
    PROVIDER_ACTION_ON_APPLICATON = 11,

    SEEKR_APPLY_ON_JOB = 12,
    PROVIDER_HIRE_FOR_JOB = 13,

    SEEKER_SET_PROVIDER_RATING = 14,
    PROVIDER_SET_SEEKER_RATING = 15,

    JOB_COMPLETE = 16,
    JOB_EXPIRED = 17,
    JOB_ACTIVE = 18,
    REMOVE_SEEKER_FROM_JOB = 19
}