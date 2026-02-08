import type * as types from './types';
import type { ConfigOptions, FetchResponse } from 'api/dist/core'
import Oas from 'oas';
import APICore from 'api/dist/core';
import definition from './openapi.json';

class SDK {
  spec: Oas;
  core: APICore;

  constructor() {
    this.spec = Oas.init(definition);
    this.core = new APICore(this.spec, 'transfi-docs/1.0 (api/6.1.3)');
  }

  /**
   * Optionally configure various options that the SDK allows.
   *
   * @param config Object of supported SDK options and toggles.
   * @param config.timeout Override the default `fetch` request timeout of 30 seconds. This number
   * should be represented in milliseconds.
   */
  config(config: ConfigOptions) {
    this.core.setConfig(config);
  }

  /**
   * If the API you're using requires authentication you can supply the required credentials
   * through this method and the library will magically determine how they should be used
   * within your API request.
   *
   * With the exception of OpenID and MutualTLS, it supports all forms of authentication
   * supported by the OpenAPI specification.
   *
   * @example <caption>HTTP Basic auth</caption>
   * sdk.auth('username', 'password');
   *
   * @example <caption>Bearer tokens (HTTP or OAuth 2)</caption>
   * sdk.auth('myBearerToken');
   *
   * @example <caption>API Keys</caption>
   * sdk.auth('myApiKey');
   *
   * @see {@link https://spec.openapis.org/oas/v3.0.3#fixed-fields-22}
   * @see {@link https://spec.openapis.org/oas/v3.1.0#fixed-fields-22}
   * @param values Your auth credentials for the API; can specify up to two strings or numbers.
   */
  auth(...values: string[] | number[]) {
    this.core.setAuth(...values);
    return this;
  }

  /**
   * If the API you're using offers alternate server URLs, and server variables, you can tell
   * the SDK which one to use with this method. To use it you can supply either one of the
   * server URLs that are contained within the OpenAPI definition (along with any server
   * variables), or you can pass it a fully qualified URL to use (that may or may not exist
   * within the OpenAPI definition).
   *
   * @example <caption>Server URL with server variables</caption>
   * sdk.server('https://{region}.api.example.com/{basePath}', {
   *   name: 'eu',
   *   basePath: 'v14',
   * });
   *
   * @example <caption>Fully qualified server URL</caption>
   * sdk.server('https://eu.api.example.com/v14');
   *
   * @param url Server URL
   * @param variables An object of variables to replace into the server URL.
   */
  server(url: string, variables = {}) {
    this.core.setServer(url, variables);
  }

  /**
   * Retrieves a list of all fiat currencies available for payin and payout, including
   * supported local currencies that comply with the [ISO 4217
   * standard](https://en.wikipedia.org/wiki/ISO_4217#) (e.g., USD). This list specifies the
   * currencies that merchants can display on a payment page for end users but does not
   * include the currencies that can be stored in wallets on the platform.
   *
   * @summary List Currencies
   * @throws FetchError<400, types.ListSupportedCurrenciesResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.ListSupportedCurrenciesResponse404> No resource found
   */
  listSupportedCurrencies(metadata: types.ListSupportedCurrenciesMetadataParam): Promise<FetchResponse<200, types.ListSupportedCurrenciesResponse200>> {
    return this.core.fetch('/v2/supported-currencies', 'get', metadata);
  }

  /**
   * To retrieve a list of banks and local wallets currently supported, we can enable
   * additional methods based on your preferences. Please contact our team to request the
   * activation of more methods.
   *
   * @summary List Payment Methods
   * @throws FetchError<400, types.ListPaymentMethodsResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.ListPaymentMethodsResponse404> No resource found.
   */
  listPaymentMethods(metadata: types.ListPaymentMethodsMetadataParam): Promise<FetchResponse<200, types.ListPaymentMethodsResponse200>> {
    return this.core.fetch('/v2/payment-methods', 'get', metadata);
  }

  /**
   * Retrieves a list of all display cryptocurrencies and networks available on the API.This
   * list specifies the cryptocurrencies that merchants can display on a payment page for end
   * users but does not include the cryptocurrencies that can be stored in wallets on the
   * platform.
   *
   * @summary List Tokens
   * @throws FetchError<400, types.ListTokensResponse400> Request containing missing or invalid parameters.
   */
  listTokens(metadata?: types.ListTokensMetadataParam): Promise<FetchResponse<200, types.ListTokensResponse200>> {
    return this.core.fetch('/v2/config/list-tokens', 'get', metadata);
  }

  /**
   * Retrieves the current live rates for deposits and withdrawals for the same currency,
   * offering real-time exchange rate information.
   *
   * @summary Live Rates
   * @throws FetchError<400, types.GetLiveRatesSameCurrencyResponse400> Request containing missing or invalid parameters.
   */
  getLiveRatesSameCurrency(metadata: types.GetLiveRatesSameCurrencyMetadataParam): Promise<FetchResponse<200, types.GetLiveRatesSameCurrencyResponse200>> {
    return this.core.fetch('/v2/exchange-rates/live-rates', 'get', metadata);
  }

  /**
   * This API allows you to retrieve a quote for converting a specified fiat amount into a
   * corresponding cryptocurrency amount. It requires key parameters such as the fiat
   * currency (fiatTicker), the amount to convert (amount), the target cryptocurrency
   * (cryptoTicker), and the payment method (paymentCode). The response provides the
   * conversion details based on real-time rates. The cURL example demonstrates how to use
   * the API with required headers and query parameters.
   *
   * @summary Onramp - Fiat to Cryptocurrency
   * @throws FetchError<400, types.GetLiveRatesFiatToCryptoResponse400> Request containing missing or invalid parameters.
   */
  getLiveRatesFiatToCrypto(body: types.GetLiveRatesFiatToCryptoBodyParam, metadata: types.GetLiveRatesFiatToCryptoMetadataParam): Promise<FetchResponse<200, types.GetLiveRatesFiatToCryptoResponse200>>;
  getLiveRatesFiatToCrypto(metadata: types.GetLiveRatesFiatToCryptoMetadataParam): Promise<FetchResponse<200, types.GetLiveRatesFiatToCryptoResponse200>>;
  getLiveRatesFiatToCrypto(body?: types.GetLiveRatesFiatToCryptoBodyParam | types.GetLiveRatesFiatToCryptoMetadataParam, metadata?: types.GetLiveRatesFiatToCryptoMetadataParam): Promise<FetchResponse<200, types.GetLiveRatesFiatToCryptoResponse200>> {
    return this.core.fetch('/v2/exchange-rates/fiat-to-crypto', 'get', body, metadata);
  }

  /**
   * This API provides real-time conversion quotes for selling cryptocurrency in exchange for
   * fiat currency. Users can specify the crypto currency (cryptoTicker), the amount to
   * convert (amount), the fiat currency (fiatTicker). The response contains conversion
   * details, enabling businesses to calculate precise payout amounts. The cURL example
   * illustrates the required headers and query parameters for API usage.
   *
   * @summary Offramp - Cryptocurrency to Fiat
   * @throws FetchError<400, types.GetLiveRatesCryptoToFiatResponse400> Request containing missing or invalid parameters
   */
  getLiveRatesCryptoToFiat(metadata: types.GetLiveRatesCryptoToFiatMetadataParam): Promise<FetchResponse<200, types.GetLiveRatesCryptoToFiatResponse200>> {
    return this.core.fetch('/v2/exchange-rates/crypto-to-fiat', 'get', metadata);
  }

  /**
   * This API allows you to retrieve a quotes for Fiat Payin with Wallet Flow. It requires
   * key parameters such as the fiat currency (depositCurrency), the amount to convert
   * (amount), and the payment method (paymentCode). The response provides the conversion
   * details based on real-time rates. The cURL example demonstrates how to use the API with
   * required headers and query parameters.
   *
   * @summary Gaming Rates
   * @throws FetchError<400, types.GetGamingRatesResponse400> Request containing missing or invalid parameters.
   */
  getGamingRates(metadata: types.GetGamingRatesMetadataParam): Promise<FetchResponse<200, types.GetGamingRatesResponse200>> {
    return this.core.fetch('/v2/exchange-rates/gaming', 'get', metadata);
  }

  /**
   * Retrieves the current quotes for paying in fiat currencies and converting to
   * stablecoins. This provides the exchange rate and the equivalent stablecoin amount for a
   * given fiat deposit, allowing users to understand the conversion rate and associated fees
   * when exchanging fiat for stablecoins.
   *
   * @summary Payin - Fiat to Stablecoin
   * @throws FetchError<400, types.GetLiveRatesDepositResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.GetLiveRatesDepositResponse404> No resource found.
   */
  getLiveRatesDeposit(metadata: types.GetLiveRatesDepositMetadataParam): Promise<FetchResponse<200, types.GetLiveRatesDepositResponse200>> {
    return this.core.fetch('/v2/exchange-rates/deposit', 'get', metadata);
  }

  /**
   * Retrieves the current quotes for payouts from stablecoins to fiat currencies. This
   * provides the exchange rate and the equivalent fiat amount for a given stablecoin
   * withdrawal, allowing users to understand the conversion rate and associated fees when
   * exchanging stablecoins for fiat.
   *
   * @summary Payout - Stablecoin to Fiat
   * @throws FetchError<400, types.GetLiveRatesWithdrawResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.GetLiveRatesWithdrawResponse404> No resource found.
   */
  getLiveRatesWithdraw(metadata: types.GetLiveRatesWithdrawMetadataParam): Promise<FetchResponse<200, types.GetLiveRatesWithdrawResponse200>> {
    return this.core.fetch('/v2/exchange-rates/withdraw', 'get', metadata);
  }

  /**
   * This API allows the creation of an individual user profile within the system. The user
   * can be registered as a sender or recipient, depending on the requirements of your
   * integration. The required fields include personal details such as name, email, country,
   * and address, along with additional fields based on compliance requirements.
   *
   * @summary Create Individual
   * @throws FetchError<400, types.CreateIndividualUserResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.CreateIndividualUserResponse404> No resource found.
   * @throws FetchError<409, types.CreateIndividualUserResponse409> User Already Exists - Conflict
   */
  createIndividualUser(body: types.CreateIndividualUserBodyParam, metadata?: types.CreateIndividualUserMetadataParam): Promise<FetchResponse<201, types.CreateIndividualUserResponse201>> {
    return this.core.fetch('/v2/users/individual', 'post', body, metadata);
  }

  /**
   * This API allows you to retrieve a list of individual users registered in the system. Use
   * the GET method to query the endpoint with appropriate headers. The response will include
   * details about individual users, enabling you to review or manage their profiles based on
   * your integration requirements.
   *
   * @summary List Individuals
   * @throws FetchError<400, types.ListIndividualUsersResponse400> Request containing invalid or missing parameters.
   * @throws FetchError<404, types.ListIndividualUsersResponse404> No resource found.
   */
  listIndividualUsers(metadata?: types.ListIndividualUsersMetadataParam): Promise<FetchResponse<200, types.ListIndividualUsersResponse200>> {
    return this.core.fetch('/v2/users/individuals', 'get', metadata);
  }

  /**
   * This API facilitates the creation of a business user profile in the system. A business
   * user can be registered as either a sender or a recipient, depending on your integration
   * needs. Required fields include business details such as name, registration number,
   * email, country, and address, along with additional fields to meet compliance
   * requirements.
   *
   * @summary Create Business
   * @throws FetchError<400, types.CreateBusinessUserResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<409, types.CreateBusinessUserResponse409> Business user already exists
   */
  createBusinessUser(body: types.CreateBusinessUserBodyParam, metadata?: types.CreateBusinessUserMetadataParam): Promise<FetchResponse<201, types.CreateBusinessUserResponse201>> {
    return this.core.fetch('/v2/users/business', 'post', body, metadata);
  }

  /**
   * This API retrieves a list of registered business users from the system. Using the GET
   * method, it allows you to query business user details for management or review purposes.
   * The provided cURL request demonstrates how to make the API call, including necessary
   * headers.
   *
   * @summary List Business
   */
  listBusinessUsers(metadata?: types.ListBusinessUsersMetadataParam): Promise<FetchResponse<200, types.ListBusinessUsersResponse200>> {
    return this.core.fetch('/v2/users/business', 'get', metadata);
  }

  /**
   * Our KYC API simplifies user verification, boosting conversion rates while adhering to
   * global AML and KYC standards. We collect necessary documents using a risk-based approach
   * to ensure compliance. With our KYC endpoints, you can verify users during sign-up or
   * later. Once verified, users can make or receive payments seamlessly. KYC is mandatory
   * for fund senders. Using our API, you can directly KYC your users through our partnership
   * with Sumsub. The endpoint provides a URL for users to complete their KYC verification
   * efficiently.
   *
   * @summary Submit KYC
   * @throws FetchError<400, types.KycStandardResponse400> Request containing missing or invalid parameters
   * @throws FetchError<404, types.KycStandardResponse404> No resource found.
   * @throws FetchError<500, types.KycStandardResponse500> Unexpected error. User may try and send the request again.
   */
  kycStandard(body: types.KycStandardBodyParam, metadata?: types.KycStandardMetadataParam): Promise<FetchResponse<200, types.KycStandardResponse200>> {
    return this.core.fetch('/v2/kyc/standard', 'post', body, metadata);
  }

  /**
   * Our Advanced KYC API extends the verification process beyond standard KYC, enabling
   * users to access higher transaction limits and enhanced features while maintaining strict
   * compliance with global AML and KYC standards
   *
   * @summary Submit Advanced KYC
   * @throws FetchError<400, types.KycAdvancedResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<500, types.KycAdvancedResponse500> Unexpected error. User may try and send the request again.
   */
  kycAdvanced(body: types.KycAdvancedBodyParam, metadata?: types.KycAdvancedMetadataParam): Promise<FetchResponse<200, types.KycAdvancedResponse200>> {
    return this.core.fetch('/v2/kyc/advanced', 'post', body, metadata);
  }

  /**
   * Our KYC API simplifies the user verification process, boosting your conversion rate. We
   * adhere to the highest global standards for AML and KYC, collecting necessary documents
   * from your users using a risk-based approach. With our KYC endpoints, you can verify
   * customers during sign-up or at their convenience. Once verified, they can make or
   * receive payments without extra steps during checkout. It is mandatory for the sender of
   * funds to be KYCed with the relevant documents. TransFi and its clients can enter into a
   * tripartite agreement with Sumsub to enable direct KYC sharing based on a common token.
   * This endpoint facilitates seamless integration for sharing KYC data.
   *
   * @summary Share KYC With Token
   * @throws FetchError<400, types.KycShareSameVendorResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.KycShareSameVendorResponse404> Request containing missing or invalid parameters.
   * @throws FetchError<422, types.KycShareSameVendorResponse422> Unprocessable Entity - Request data validation failed.
   * @throws FetchError<500, types.KycShareSameVendorResponse500> Unexpected error. User may try and send the request again.
   */
  kycShareSameVendor(body?: types.KycShareSameVendorBodyParam, metadata?: types.KycShareSameVendorMetadataParam): Promise<FetchResponse<200, types.KycShareSameVendorResponse200>> {
    return this.core.fetch('/v2/kyc/share/same-vendor', 'post', body, metadata);
  }

  /**
   * Our KYC API simplifies the user verification process, increasing your conversion rate.
   * We adhere to the highest global standards for AML and KYC and gather necessary documents
   * from our customer's users using a risk-based approach. Using our KYC endpoints, you can
   * verify customers during sign-up or at their convenience. Once verified, they can make or
   * receive payments without any extra steps during checkout. It is mandatory for the sender
   * of funds to be KYCed with relevant documents. If you do not use Sumsub as your KYC
   * provider, fret not! You can pass the required KYC information directly to us and we will
   * take care of the rest.
   *
   * @summary Share KYC Without Token
   * @throws FetchError<404, types.KycShareThirdVendorResponse404> Request containing missing or invalid parameters.
   * @throws FetchError<500, types.KycShareThirdVendorResponse500> Unexpected error. User may try and send the request again.
   */
  kycShareThirdVendor(body: types.KycShareThirdVendorBodyParam, metadata?: types.KycShareThirdVendorMetadataParam): Promise<FetchResponse<200, types.KycShareThirdVendorResponse200>> {
    return this.core.fetch('/v2/kyc/share/third-vendor', 'post', body, metadata);
  }

  /**
   * For higher transactional volumes, once certain thresholds for payments have been
   * reached, it is necessary to collect additional documents and information from the sender
   * of funds. These requests can be fulfilled by sharing the required data directly using
   * this endpoint. Additionally, for specific countries, supplementary documents—beyond the
   * standard requirements—can also be shared using this endpoint.
   *
   * @summary Share Additional Docs
   * @throws FetchError<400, types.KycShareAddDocsResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<500, types.KycShareAddDocsResponse500> Unexpected error. User may try and send the request again.
   */
  kycShareAddDocs(body: types.KycShareAddDocsBodyParam, metadata?: types.KycShareAddDocsMetadataParam): Promise<FetchResponse<200, types.KycShareAddDocsResponse200>> {
    return this.core.fetch('/v2/kyc/share/add-docs', 'post', body, metadata);
  }

  /**
   * This endpoint helps to get KYC status of the user
   *
   * @summary KYC Status
   * @throws FetchError<400, types.GetUserKycStatusResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.GetUserKycStatusResponse404> No resource found.
   * @throws FetchError<500, types.GetUserKycStatusResponse500> Unexpected error. User may try and send the request again.
   */
  getUserKycStatus(metadata: types.GetUserKycStatusMetadataParam): Promise<FetchResponse<200, types.GetUserKycStatusResponse200>> {
    return this.core.fetch('/v2/kyc/user', 'get', metadata);
  }

  /**
   * This API endpoint allows you to upload a PDF document (e.g. an invoice or bill). In
   * response, it returns a unique invoiceId that serves as a reference to the uploaded
   * document.
   *
   * You can then include this invoiceId in the root level of the payload when creating a
   * Payin or Payout order to associate the uploaded invoice with that transaction.
   *
   * @summary Upload Invoice
   * @throws FetchError<400, types.CreateInvoiceUploadResponse400> Bad Request
   */
  createInvoiceUpload(body: types.CreateInvoiceUploadBodyParam, metadata?: types.CreateInvoiceUploadMetadataParam): Promise<FetchResponse<200, types.CreateInvoiceUploadResponse200>> {
    return this.core.fetch('/v2/invoices/create', 'post', body, metadata);
  }

  /**
   * We collect necessary documents using a risk-based approach to ensure compliance. With
   * our KYB endpoints, you can verify users during sign-up or later. Once verified, users
   * can make or receive payments seamlessly. KYB is mandatory for fund senders. Using our
   * API, you can directly KYB your users. The endpoint provides a URL for users to complete
   * their KYB verification efficiently.
   *
   * @summary Standard KYB
   * @throws FetchError<400, types.KybStandardResponse400> Basic KYB not Approved
   * @throws FetchError<404, types.KybStandardResponse404> User Not Found
   */
  kybStandard(body: types.KybStandardBodyParam, metadata?: types.KybStandardMetadataParam): Promise<FetchResponse<200, types.KybStandardResponse200>> {
    return this.core.fetch('/v2/kyb/standard', 'post', body, metadata);
  }

  /**
   * We collect necessary documents using a risk-based approach to ensure compliance. With
   * our Advanced KYB endpoint, you can verify users who have completed Standard KYB
   * verification. Once verified, users can make or receive payments seamlessly. Advanced KYB
   * is mandatory for higher transaction limits. Using our API, you can directly initiate
   * Advanced KYB for your users. The endpoint provides a URL for users to complete their
   * Advanced KYB verification efficiently.
   *
   * @summary Advanced KYB
   * @throws FetchError<400, types.KybAdvancedResponse400> Basic KYB not Approved
   * @throws FetchError<404, types.KybAdvancedResponse404> User Not Found
   */
  kybAdvanced(body: types.KybAdvancedBodyParam, metadata?: types.KybAdvancedMetadataParam): Promise<FetchResponse<200, types.KybAdvancedResponse200>> {
    return this.core.fetch('/v2/kyb/advanced', 'post', body, metadata);
  }

  /**
   * This endpoint helps to get KYB status of the user
   *
   * @summary KYB Status
   * @throws FetchError<404, types.GetUserKybStatusResponse404> Not Found
   */
  getUserKybStatus(metadata: types.GetUserKybStatusMetadataParam): Promise<FetchResponse<200, types.GetUserKybStatusResponse200>> {
    return this.core.fetch('/v2/kyb/user', 'get', metadata);
  }

  /**
   * Payments in fiat currencies can be accepted from end users. These payments can be
   * settled either in a batch or instantly, depending on the preconfigured settings.
   *
   * @summary Create Payin
   * @throws FetchError<400, types.CreateCollectionOrderResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<403, types.CreateCollectionOrderResponse403> Restrcited or Forbidden Access
   * @throws FetchError<404, types.CreateCollectionOrderResponse404> No resource found.
   */
  createCollectionOrder(body: types.CreateCollectionOrderBodyParam, metadata?: types.CreateCollectionOrderMetadataParam): Promise<FetchResponse<200, types.CreateCollectionOrderResponse200>> {
    return this.core.fetch('/v2/orders/deposit', 'post', body, metadata);
  }

  /**
   * This API is used to initiate a payin transaction where a user can deposit funds using
   * their wallet to a gaming platform.
   *
   * @summary Create Payin with wallet
   * @throws FetchError<400, types.CreateCollectionOrderWithWalletResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<403, types.CreateCollectionOrderWithWalletResponse403> Restrcited or Forbidden Access
   * @throws FetchError<404, types.CreateCollectionOrderWithWalletResponse404> No resource found.
   */
  createCollectionOrderWithWallet(body: types.CreateCollectionOrderWithWalletBodyParam, metadata?: types.CreateCollectionOrderWithWalletMetadataParam): Promise<FetchResponse<200, types.CreateCollectionOrderWithWalletResponse200>> {
    return this.core.fetch('/v2/orders/gaming', 'post', body, metadata);
  }

  /**
   * Retrieves detailed information about a specific order, including its status and
   * associated details.
   *
   * @summary Get Details
   * @throws FetchError<400, types.GetOrderDetailsResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.GetOrderDetailsResponse404> No resource found
   */
  getOrderDetails(metadata: types.GetOrderDetailsMetadataParam): Promise<FetchResponse<200, types.GetOrderDetailsResponse200>> {
    return this.core.fetch('/v2/orders/{orderId}', 'get', metadata);
  }

  /**
   * Payouts in fiat currencies can be created for end users. These can be processed by
   * prefunding TransFi in advance or using the payin balance (unsettled), depending on the
   * preconfigured settings.
   *
   * @summary Create Payout
   * @throws FetchError<400, types.CreatePayoutOrderResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<403, types.CreatePayoutOrderResponse403> Restrcited or Forbidden Access
   * @throws FetchError<404, types.CreatePayoutOrderResponse404> No resource found
   */
  createPayoutOrder(body: types.CreatePayoutOrderBodyParam, metadata?: types.CreatePayoutOrderMetadataParam): Promise<FetchResponse<200, types.CreatePayoutOrderResponse200>> {
    return this.core.fetch('/v2/payout/orders', 'post', body, metadata);
  }

  /**
   * Payments in cryptocurrencies can be accepted from end users. These payments can be
   * settled with you either in a batch or instantly, depending on the preconfigured
   * settings.
   *
   * @summary Payin
   * @throws FetchError<400, types.CreateCryptoPayinOrderResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.CreateCryptoPayinOrderResponse404> No resource found.
   * @throws FetchError<500, types.CreateCryptoPayinOrderResponse500> Unexpected error. User may try and send the request again.
   */
  createCryptoPayinOrder(body: types.CreateCryptoPayinOrderBodyParam, metadata?: types.CreateCryptoPayinOrderMetadataParam): Promise<FetchResponse<200, types.CreateCryptoPayinOrderResponse200>> {
    return this.core.fetch('/v2/crypto/payin', 'post', body, metadata);
  }

  /**
   * Payouts in cryptocurrencies can be created for end users. These can be prefunded by
   * transferring funds to TransFi beforehand or done via your payin balance (unsettled),
   * depending on the preconfigured settings.
   *
   * @summary Payout
   * @throws FetchError<400, types.CreateCryptoPayoutOrderResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<404, types.CreateCryptoPayoutOrderResponse404> No resource found.
   * @throws FetchError<500, types.CreateCryptoPayoutOrderResponse500> Unexpected error. User may try and send the request again.
   */
  createCryptoPayoutOrder(body: types.CreateCryptoPayoutOrderBodyParam, metadata?: types.CreateCryptoPayoutOrderMetadataParam): Promise<FetchResponse<200, types.CreateCryptoPayoutOrderResponse200>> {
    return this.core.fetch('/v2/crypto/payout', 'post', body, metadata);
  }

  /**
   * Prefunds in cryptocurrencies can be accepted from organizations. These prefunds can be
   * used for payouts.
   * ***Note: Does not support USDCBASE cryptoTicker, Please use /create-crypto-prefund
   * api***
   *
   * @summary Crypto Prefund - Wallet Address
   * @throws FetchError<400, types.CreateCryptoPrefundResponse400> Request containing missing or invalid parameters.
   */
  createCryptoPrefund(body: types.CreateCryptoPrefundBodyParam, metadata?: types.CreateCryptoPrefundMetadataParam): Promise<FetchResponse<200, types.CreateCryptoPrefundResponse200>> {
    return this.core.fetch('/v2/prefunds/crypto-prefund', 'post', body, metadata);
  }

  /**
   * Retrieves balance details for the specified **MID** (merchant or sub-merchant). If
   * **MID** is not provided, returns aggregated balances across all supported currencies and
   * entities.
   *
   * @summary Get Balance
   */
  getBalance(metadata?: types.GetBalanceMetadataParam): Promise<FetchResponse<200, types.GetBalanceResponse200>> {
    return this.core.fetch('/v2/balance', 'get', metadata);
  }

  /**
   * Prefunds in cryptocurrencies can be accepted from organizations. These prefunds can be
   * used for payouts.
   *
   * @summary Create Crypto Prefund
   * @throws FetchError<400, types.CreateCryptoPrefundOrderResponse400> Request containing missing or invalid parameters.
   */
  createCryptoPrefundOrder(body: types.CreateCryptoPrefundOrderBodyParam, metadata?: types.CreateCryptoPrefundOrderMetadataParam): Promise<FetchResponse<200, types.CreateCryptoPrefundOrderResponse200>> {
    return this.core.fetch('/v2/prefunds/create-crypto-prefund', 'post', body, metadata);
  }

  /**
   * ***Note: Sandbox Only API*** <br/>
   * Prefunds in any currency can be accepted from organizations. These prefunds can be used
   * for payouts.
   *
   * @summary Create Sandbox Prefund
   * @throws FetchError<400, types.CreateSandboxPrefundResponse400> Request containing missing or invalid parameters.
   * @throws FetchError<403, types.CreateSandboxPrefundResponse403> Restrcited or Forbidden Access
   */
  createSandboxPrefund(body: types.CreateSandboxPrefundBodyParam, metadata?: types.CreateSandboxPrefundMetadataParam): Promise<FetchResponse<200, types.CreateSandboxPrefundResponse200>> {
    return this.core.fetch('/v2/sandbox/prefunds/create-prefund', 'post', body, metadata);
  }

  /**
   * Prefunds in Fiat Currencies can be accepted from organizations. These prefunds can be
   * used for payouts.
   *
   * @summary Create Fiat Prefund
   * @throws FetchError<400, types.CreateFiatPrefundOrderResponse400> Bad Request
   */
  createFiatPrefundOrder(body: types.CreateFiatPrefundOrderBodyParam): Promise<FetchResponse<200, types.CreateFiatPrefundOrderResponse200>> {
    return this.core.fetch('/v2/prefunds/create-fiat-prefund', 'post', body);
  }
}

const createSDK = (() => { return new SDK(); })()
;

export default createSDK;

export type { CreateBusinessUserBodyParam, CreateBusinessUserMetadataParam, CreateBusinessUserResponse201, CreateBusinessUserResponse400, CreateBusinessUserResponse409, CreateCollectionOrderBodyParam, CreateCollectionOrderMetadataParam, CreateCollectionOrderResponse200, CreateCollectionOrderResponse400, CreateCollectionOrderResponse403, CreateCollectionOrderResponse404, CreateCollectionOrderWithWalletBodyParam, CreateCollectionOrderWithWalletMetadataParam, CreateCollectionOrderWithWalletResponse200, CreateCollectionOrderWithWalletResponse400, CreateCollectionOrderWithWalletResponse403, CreateCollectionOrderWithWalletResponse404, CreateCryptoPayinOrderBodyParam, CreateCryptoPayinOrderMetadataParam, CreateCryptoPayinOrderResponse200, CreateCryptoPayinOrderResponse400, CreateCryptoPayinOrderResponse404, CreateCryptoPayinOrderResponse500, CreateCryptoPayoutOrderBodyParam, CreateCryptoPayoutOrderMetadataParam, CreateCryptoPayoutOrderResponse200, CreateCryptoPayoutOrderResponse400, CreateCryptoPayoutOrderResponse404, CreateCryptoPayoutOrderResponse500, CreateCryptoPrefundBodyParam, CreateCryptoPrefundMetadataParam, CreateCryptoPrefundOrderBodyParam, CreateCryptoPrefundOrderMetadataParam, CreateCryptoPrefundOrderResponse200, CreateCryptoPrefundOrderResponse400, CreateCryptoPrefundResponse200, CreateCryptoPrefundResponse400, CreateFiatPrefundOrderBodyParam, CreateFiatPrefundOrderResponse200, CreateFiatPrefundOrderResponse400, CreateIndividualUserBodyParam, CreateIndividualUserMetadataParam, CreateIndividualUserResponse201, CreateIndividualUserResponse400, CreateIndividualUserResponse404, CreateIndividualUserResponse409, CreateInvoiceUploadBodyParam, CreateInvoiceUploadMetadataParam, CreateInvoiceUploadResponse200, CreateInvoiceUploadResponse400, CreatePayoutOrderBodyParam, CreatePayoutOrderMetadataParam, CreatePayoutOrderResponse200, CreatePayoutOrderResponse400, CreatePayoutOrderResponse403, CreatePayoutOrderResponse404, CreateSandboxPrefundBodyParam, CreateSandboxPrefundMetadataParam, CreateSandboxPrefundResponse200, CreateSandboxPrefundResponse400, CreateSandboxPrefundResponse403, GetBalanceMetadataParam, GetBalanceResponse200, GetGamingRatesMetadataParam, GetGamingRatesResponse200, GetGamingRatesResponse400, GetLiveRatesCryptoToFiatMetadataParam, GetLiveRatesCryptoToFiatResponse200, GetLiveRatesCryptoToFiatResponse400, GetLiveRatesDepositMetadataParam, GetLiveRatesDepositResponse200, GetLiveRatesDepositResponse400, GetLiveRatesDepositResponse404, GetLiveRatesFiatToCryptoBodyParam, GetLiveRatesFiatToCryptoMetadataParam, GetLiveRatesFiatToCryptoResponse200, GetLiveRatesFiatToCryptoResponse400, GetLiveRatesSameCurrencyMetadataParam, GetLiveRatesSameCurrencyResponse200, GetLiveRatesSameCurrencyResponse400, GetLiveRatesWithdrawMetadataParam, GetLiveRatesWithdrawResponse200, GetLiveRatesWithdrawResponse400, GetLiveRatesWithdrawResponse404, GetOrderDetailsMetadataParam, GetOrderDetailsResponse200, GetOrderDetailsResponse400, GetOrderDetailsResponse404, GetUserKybStatusMetadataParam, GetUserKybStatusResponse200, GetUserKybStatusResponse404, GetUserKycStatusMetadataParam, GetUserKycStatusResponse200, GetUserKycStatusResponse400, GetUserKycStatusResponse404, GetUserKycStatusResponse500, KybAdvancedBodyParam, KybAdvancedMetadataParam, KybAdvancedResponse200, KybAdvancedResponse400, KybAdvancedResponse404, KybStandardBodyParam, KybStandardMetadataParam, KybStandardResponse200, KybStandardResponse400, KybStandardResponse404, KycAdvancedBodyParam, KycAdvancedMetadataParam, KycAdvancedResponse200, KycAdvancedResponse400, KycAdvancedResponse500, KycShareAddDocsBodyParam, KycShareAddDocsMetadataParam, KycShareAddDocsResponse200, KycShareAddDocsResponse400, KycShareAddDocsResponse500, KycShareSameVendorBodyParam, KycShareSameVendorMetadataParam, KycShareSameVendorResponse200, KycShareSameVendorResponse400, KycShareSameVendorResponse404, KycShareSameVendorResponse422, KycShareSameVendorResponse500, KycShareThirdVendorBodyParam, KycShareThirdVendorMetadataParam, KycShareThirdVendorResponse200, KycShareThirdVendorResponse404, KycShareThirdVendorResponse500, KycStandardBodyParam, KycStandardMetadataParam, KycStandardResponse200, KycStandardResponse400, KycStandardResponse404, KycStandardResponse500, ListBusinessUsersMetadataParam, ListBusinessUsersResponse200, ListIndividualUsersMetadataParam, ListIndividualUsersResponse200, ListIndividualUsersResponse400, ListIndividualUsersResponse404, ListPaymentMethodsMetadataParam, ListPaymentMethodsResponse200, ListPaymentMethodsResponse400, ListPaymentMethodsResponse404, ListSupportedCurrenciesMetadataParam, ListSupportedCurrenciesResponse200, ListSupportedCurrenciesResponse400, ListSupportedCurrenciesResponse404, ListTokensMetadataParam, ListTokensResponse200, ListTokensResponse400 } from './types';
