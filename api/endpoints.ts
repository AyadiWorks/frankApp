import { getGlobalState } from "../utils/Global";
import client from "./client";
import {
  ACCOUNT_URL,
  BRANCHE_URL,
  ACCOUNT_GLOBAL_URL,
  ACCOUNT_URL_1,
  ACCOUNT_URL_2,
  ACCOUNT_URL_3,
  ACCOUNT_URL_4,
} from "../constants/GlobalConstants";

const customerEndPoint = `/Auth/get-customer-info`;
const getUserDetailEndPoint = "Auth/GetDetailUser";
const menuEndPoint = `/Menu/get-published-menu-with-items`;
const addressEndPoint = `/Order/get-address-pick-up`;
const sendSmsEndPoint = `/Message/send-sms`; //  send-sms by send-verification-code
const authOtpEndPoint = `/Message/auth-otp`; // auth-otp replace it by signiniverification-code
const sendSmsVerificationEndPoint = `/Message/send-verification-code`;
const authOtpVerificationEndPoint = `/Message/signin-verification-code`;
const registerEndPoint = `/Auth/customer-signup`;
const listAddressEndPoint = `/Order/get-list-address-delivery`;
const selectDeliveryLocationEndPoint = `/Outlets/select-delivery-location`;
const deleteAddressDeliveryEndPoint = `/Order/delete-address-deliveryTo`;
const createDeliveryAddressEndPoint = `/Order/create-address-deliveryTo`;
const getOneItemWithModifierEndPoint = `/Menu/get-oneitem-with-modifiers`;
const getDeliveryDataEndPoint = `/Outlets/get-delivery-data`;
const getOutletOrderEndPoint = `/Order/get-outlet-order`;
const getDeliveryDataByAreaIdEndPoint = `/Outlets/get-delivery-data-by-areaId`;
const getLoaylPointEndPoint = `/Order/get-loyal-point`;
const getAllLoaylPointEndPoint = `/Order/get-loyalty-point-multi-accounts`;
const checkUsageDiscountEndPoint = `/Order/check-usage-discount`;

const editCustomerInfoEndPoint = `/Auth/edit-customer-info`;
const getOrderOngoingEndPoint = `/Order/get-list-order-ongoing-App`;
const getOrderHistoryEndPoint = `/Order/get-list-order-history-App`;

const checkOrderByIdEndPoint = `/Order/check-order-byId`;
const getOrderByIdEndPoint = `/Outlets/get-order-byId`;

const createPaymentIntentEndPoint = `/Order/create-payment-intent`;
const checkoutOrderEndPoint = `/Order/checkout-order`;

const getOutletDeliveryEndPoint = `/Outlets/get-outlet-delivery`;
const checkOutletTimeEndPoint = `/Order/check-outlet-time`;
const getAccountByAccountNameEndPoint = `/AccountBusiness/get-account-by-account-name`;
const addLoyaltyBalanceEndPoint = `/Order/add-loyalty-balance`;
const getAllByAccountEndPoint = `/Menu/GetAll-byAccountUrl`;
const getMenuWithItemsEnpoint = `/Menu/get-menu-with-items`;
const setDeviceTokenEndPoint = `/UserManager/set-device-token`;
const getDeviceTokenEndPoint = `/UserManager/get-device-token`;
const getRestaurantByIdEndPoint = `/Auth/get-restaurant-byId`;
const getCheckoutPaymentTypeEndPoint = `/Order/get-outlet-order`;
const getOutletByIdEndPoint = `/Outlets/get-outlet-byId`;

const getStripeEphemeralKeyEndPoint = `/Payment/stripe-get-ephemeral-key-by-customerid`;
const getStripePaymentIntentEndPoint = `/Payment/stripe-create-payment-intent`;

const getRestaurantFeesEndPoint = `/Menu/GetCategoryPublishPwa`;

const getUserInfo = () =>
  client.get(
    getUserDetailEndPoint,
    {},
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const getCustomerInfo = () =>
  client.get(
    customerEndPoint,
    {},
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const getMenu = () =>
  client.get(menuEndPoint, {
    account_name: getGlobalState("account_url"),
    outlet_name: getGlobalState("branche_url"),
  });

const getAddress = (url: string) =>
  client.get(addressEndPoint, { accountUrl: url });

const sendSms = (body: any) => client.post(sendSmsEndPoint, body);
const sendSmsVerification = (body: any) => client.post(sendSmsVerificationEndPoint, body);

const authOtp = (body: any) =>
  client.post(
    authOtpEndPoint,
    {},
    { params: { ...body, account_url: ACCOUNT_GLOBAL_URL } }
  );

const authOtpVerification = (body: any, code: any) =>
  client.post(
    `${authOtpVerificationEndPoint}/?code=${code}&account_url=${ACCOUNT_GLOBAL_URL}`,
    {
      phoneNumber: body.phoneNumber,
      countryCode: body.countryCode,
      clientId: body.clientId,
      Channel: "sms",
    }
  );

const register = (body: any) =>
  client.post(registerEndPoint, body, {
    params: { accountUrl: ACCOUNT_GLOBAL_URL },
  });

const listAddressDelivery = () =>
  client.get(
    listAddressEndPoint,
    { outlet_nameUrl: ACCOUNT_GLOBAL_URL },
    { headers: { Authorization: "Bearer " + getGlobalState("token") } }
  );

const selectDeliveryAddress = (body: any) =>
  client.post(selectDeliveryLocationEndPoint, body, {
    params: { account_nameUrl: ACCOUNT_GLOBAL_URL },
  });

const deleteDeliveryAddress = (params: any) =>
  client.post(
    deleteAddressDeliveryEndPoint,
    {},
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
      params,
    }
  );

const getRestaurantById = () =>
  client.get(
    getRestaurantByIdEndPoint,
    { id: getGlobalState("outletId") },
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const createDeliveryAddress = (body: any) =>
  client.post(createDeliveryAddressEndPoint, body, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });

const getOneItemWithModifier = (params: any) =>
  client.get(getOneItemWithModifierEndPoint, {
    ...params,
    account_name: getGlobalState("account_url"),
    outlet_name: getGlobalState("branche_url"),
  });

const getDeliveryData = (account_url: string, branche_url: string) =>
  client.get(
    getDeliveryDataEndPoint,
    { accountUrl: account_url, outletUrl: branche_url },
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const getDeliveryDataByAreaId = (params: any) =>
  client.get(getDeliveryDataByAreaIdEndPoint, params);

const getLoyalPoint = () =>
  client.get(
    // getLoaylPointEndPoint,
    getAllLoaylPointEndPoint,
    {
      // account_nameUrl: getGlobalState("account_url"),
      AccountURL1: ACCOUNT_URL_1,
      AccountURL2: ACCOUNT_URL_2,
      AccountURL3: ACCOUNT_URL_3,
      AccountURL4: ACCOUNT_URL_4,
    },
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const checkUsageDiscount = (params: any) =>
  client.get(
    checkUsageDiscountEndPoint,
    { code: params.code, accountUrl: getGlobalState("account_url") },
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const getOutletOrder = () =>
  client.get(
    getOutletOrderEndPoint,
    {
      accountUrl: getGlobalState("account_url"),
      outletUrl: getGlobalState("branche_url"),
    },
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const editCustomerInfo = (body: any) =>
  client.post(editCustomerInfoEndPoint, body, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });
const getOrderOngoing = (params: any) =>
  client.get(getOrderOngoingEndPoint, params, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });
const getOrderHistory = (params: any) =>
  client.get(getOrderHistoryEndPoint, params, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });

const checkOrderById = (params: any) =>
  client.get(checkOrderByIdEndPoint, params, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });
const getOrderById = (params: any) =>
  client.get(getOrderByIdEndPoint, params, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });

const createPaymentIntent = (body: any) =>
  client.post(createPaymentIntentEndPoint, body, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });

const checkoutOrder = (body: any) =>
  client.post(checkoutOrderEndPoint, body, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
    params: {
      accountUrl: getGlobalState("account_url"),
    },
  });

const getOutletDelivery = (params: any) =>
  client.get(getOutletDeliveryEndPoint, params, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });
const getOutletById = (params: any) =>
  client.get(getOutletByIdEndPoint, params, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });

const checkOutletTime = (body: any) =>
  client.post(checkOutletTimeEndPoint, body);

const getAccountByAccountName = () =>
  client.get(
    getAccountByAccountNameEndPoint,
    {
      // account_name: getGlobalState("account_url")
      account_name: ACCOUNT_GLOBAL_URL,
    },
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const addLoyaltyBalance = (body: any) =>
  client.post(addLoyaltyBalanceEndPoint, body, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });

const getAllByAccount = (params: any) =>
  client.get(getAllByAccountEndPoint, params, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });

const getMenuWithItems = (params: any) =>
  client.get(getMenuWithItemsEnpoint, params, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });

const setDeviceToken = (params: any) =>
  client.post(
    setDeviceTokenEndPoint,
    {},
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
      params,
    }
  );

const getDeviceToken = () =>
  client.get(
    getDeviceTokenEndPoint,
    {},
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const getCheckoutPaymentType = (accountUrl: any, outletUrl: any) =>
  client.get(
    `${getCheckoutPaymentTypeEndPoint}/?accountUrl=${accountUrl}&outletUrl=${outletUrl}`,
    {},
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

const getStripePaymentIntent = (body: any) =>
  client.post(getStripePaymentIntentEndPoint, body, {
    headers: {
      Authorization: "Bearer " + getGlobalState("token"),
    },
  });

const getStripeEphemeralKey = (id: string) =>
  client.post(
    getStripeEphemeralKeyEndPoint,
    {},
    {
      params: {
        stripeCustomerId: id,
      },
    }
  );

const getRestaurantFees = () =>
  client.get(
    getRestaurantFeesEndPoint,
    {
      account_name: getGlobalState("account_url"),
      outlet_name: getGlobalState("branche_url"),
    },
    {
      headers: {
        Authorization: "Bearer " + getGlobalState("token"),
      },
    }
  );

export default {
  getUserInfo,
  getCustomerInfo,
  getMenu,
  getAddress,
  sendSms,
  sendSmsVerification,
  authOtp,
  authOtpVerification,
  register,
  listAddressDelivery,
  selectDeliveryAddress,
  deleteDeliveryAddress,
  createDeliveryAddress,
  getOneItemWithModifier,
  getDeliveryData,
  getOutletOrder,
  editCustomerInfo,
  getOrderOngoing,
  getOrderHistory,
  getLoyalPoint,
  getDeliveryDataByAreaId,
  checkOrderById,
  getOrderById,
  createPaymentIntent,
  checkoutOrder,
  checkUsageDiscount,
  getOutletDelivery,
  checkOutletTime,
  getAccountByAccountName,
  getOutletById,
  addLoyaltyBalance,
  getAllByAccount,
  getMenuWithItems,
  setDeviceToken,
  getDeviceToken,
  getRestaurantById,
  getCheckoutPaymentType,
  getStripeEphemeralKey,
  getStripePaymentIntent,
  getRestaurantFees,
};
