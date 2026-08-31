import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  ForgotPasswordScreen,
  LoginScreen,
  RegisterScreen,
  ResetPasswordScreen,
  SplashScreen,
  VerifyEmailScreen,
  WelcomeScreen,
} from "../features/auth";

export type AuthStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  VerifyEmail: { token: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Pile de navigation pré-authentification (Volume 4 : "AUTH FLOW"). */
export function AuthNavigator(): JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: true, headerTransparent: true, title: "" }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, headerTransparent: true, title: "" }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, headerTransparent: true, title: "" }} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: true, headerTransparent: true, title: "" }} />
      <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
    </Stack.Navigator>
  );
}
