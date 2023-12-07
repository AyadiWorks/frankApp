import AsyncStorage from "@react-native-async-storage/async-storage";

export const STORAGE_CART = "CARTS";
export const STORAGE_USER = "USER";

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      return JSON.parse(value);
    }
  } catch (e) {
    return null;
  }

  return null;
};
export const storeData = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {}
};

export const DATE2DATE = (date: string, detail: boolean) => {
  let temp1 = date.split("T")[0];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  let month = monthNames[new Date(temp1).getMonth()];
  let d=dayNames[new Date(temp1).getDay()];
  let day = new Date(temp1).getDate();
  let year = new Date(temp1).getFullYear();

  let temp2 = Number(date.split("T")[1].split(":")[0]);
  let min = date.split("T")[1].split(":")[1];
  let AmOrPm = temp2 >= 12 ? "PM" : "AM";
  let hours = temp2 % 12 || 12;
  if(detail){
    return `${d}, ${month} ${day} at ${hours}:${min} ${AmOrPm}`;
    // return `${d}, ${month} ${day} ${year} at ${hours}:${min} ${AmOrPm}`;
  }else {
    return `${d}, ${month} ${day}`;
  }
};
