use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Description is too long")]
    DescriptionTooLong,
    #[msg("Service already initialized")]
    ServiceAlreadyInitialized,
    #[msg("Overflow")]
    Overflow,
    #[msg("ReviewERROR")]
    ReviewError,
    #[msg("No services registered")]
    NoServicesRegistered,
    #[msg("Provide Amount Greater than 0")]
    InvalidAmount,
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    #[msg("The contract is in an invalid state for the requested operation.")]
    InvalidState,
    #[msg("Fund transfer failed.")]
    TransferFailed,
    #[msg("Invalid rating. Rating must be between 0 and 5.")]
    InvalidRating,
    #[msg("No reviews found")]
    NoReviews,
}
