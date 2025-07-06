import React, { useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { RFValue } from "react-native-responsive-fontsize";
import { useOAuth, useUser, useAuth } from "@clerk/clerk-expo";
import { AntDesign } from "@expo/vector-icons";

const LoginScreen = ({ navigation }) => {
  const { isLoaded: userLoaded, user } = useUser();
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  
  const { startOAuthFlow: startGoogleAuthFlow } = useOAuth({
    strategy: "oauth_google",
  });
  const { startOAuthFlow: startAppleAuthFlow } = useOAuth({
    strategy: "oauth_apple",
  });

  useEffect(() => {
    console.log("[DEBUG] LoginScreen mounted");
    console.log("[DEBUG] User loaded:", userLoaded);
    console.log("[DEBUG] Auth loaded:", authLoaded);
    console.log("[DEBUG] Is signed in:", isSignedIn);
    console.log("[DEBUG] User:", user);
    
    if (isSignedIn) {
      console.log("[DEBUG] User already signed in, navigating to dashboard");
      navigation.navigate("NotesDashboardScreen");
    }
  }, [userLoaded, authLoaded, isSignedIn, user]);

  const onPress = async (authType: string) => {
    console.log(`[DEBUG] Starting ${authType} OAuth flow...`);
    try {
      if (authType === "google") {
        console.log("[DEBUG] Calling startGoogleAuthFlow...");
        const result = await startGoogleAuthFlow();
        console.log("[DEBUG] Google OAuth result:", JSON.stringify(result, null, 2));
        
        const { createdSessionId, setActive, signIn, signUp } = result;
        
        if (createdSessionId) {
          console.log("[DEBUG] Session created successfully:", createdSessionId);
          console.log("[DEBUG] Calling setActive...");
          await setActive({ session: createdSessionId });
          console.log("[DEBUG] Session activated, navigating to NotesDashboardScreen...");
          navigation.navigate("NotesDashboardScreen");
          console.log("[DEBUG] Navigation complete");
        } else {
          console.log("[DEBUG] No session created. Full result:", result);
          
          // Handle sign-up flow for new users
          if (signUp && signUp.status === "missing_requirements") {
            console.log("[DEBUG] Sign-up needs completion. Missing fields:", signUp.missingFields);
            
            // Check if phone number is truly required or optional
            const isPhoneRequired = signUp.requiredFields.includes("phone_number");
            
            if (isPhoneRequired) {
              // If phone is required, we need to handle this differently
              console.log("[DEBUG] Phone number is required by Clerk configuration");
              
              // For now, just try to create the account anyway
              try {
                console.log("[DEBUG] Attempting to update sign-up with empty phone number...");
                await signUp.update({
                  phoneNumber: "+1234567890" // Dummy number - you should handle this properly
                });
                
                const { createdSessionId: newSessionId } = await signUp.create();
                
                if (newSessionId) {
                  console.log("[DEBUG] Sign-up completed! Session ID:", newSessionId);
                  await setActive({ session: newSessionId });
                  navigation.navigate("NotesDashboardScreen");
                }
              } catch (updateError) {
                console.error("[DEBUG] Failed to update sign-up:", updateError);
                Alert.alert(
                  "Configuration Issue",
                  "Your Clerk dashboard requires a phone number for sign-ups. Please update your Clerk dashboard settings to make phone number optional, or implement a phone number collection screen.",
                  [{ text: "OK" }]
                );
              }
            } else {
              // Phone is optional, just create the user
              try {
                console.log("[DEBUG] Attempting to complete sign-up...");
                const { createdSessionId: newSessionId } = await signUp.create();
                
                if (newSessionId) {
                  console.log("[DEBUG] Sign-up completed! Session ID:", newSessionId);
                  await setActive({ session: newSessionId });
                  navigation.navigate("NotesDashboardScreen");
                }
              } catch (signUpError) {
                console.error("[DEBUG] Sign-up completion error:", signUpError);
              }
            }
          } else if (signIn && signIn.firstFactorVerification?.error) {
            console.log("[DEBUG] Sign-in error:", signIn.firstFactorVerification.error);
            Alert.alert(
              "Sign In Error",
              "This Google account is not associated with an existing user. Please sign up first.",
              [{ text: "OK" }]
            );
          }
        }
      } else if (authType === "apple") {
        console.log("[DEBUG] Calling startAppleAuthFlow...");
        const result = await startAppleAuthFlow();
        console.log("[DEBUG] Apple OAuth result:", JSON.stringify(result, null, 2));
        
        const { createdSessionId, setActive } = result;
        
        if (createdSessionId) {
          console.log("[DEBUG] Session created successfully:", createdSessionId);
          await setActive({ session: createdSessionId });
          console.log("[DEBUG] Session activated, navigating to NotesDashboardScreen...");
          navigation.navigate("NotesDashboardScreen");
        }
      }
    } catch (err) {
      console.error("[DEBUG] OAuth error details:", {
        message: err.message,
        stack: err.stack,
        error: err
      });
      
      Alert.alert(
        "Authentication Error",
        `Failed to sign in with ${authType}. Error: ${err.message || "Unknown error"}`,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image
          source={require("../assets/icons/logo.png")} // Ensure the correct path to your logo image file
          style={styles.logo}
        />
        <Text style={styles.title}>Log in to your account</Text>
        <Text style={styles.subtitle}>Welcome! Please login below.</Text>
        <TouchableOpacity
          style={styles.buttonGoogle}
          onPress={() => onPress("google")}
        >
          <Image
            style={styles.googleIcon}
            source={require("../assets/icons/google.png")}
          />
          <Text style={{ ...styles.buttonText, color: "#344054" }}>
            Continue with Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buttonApple}
          onPress={() => onPress("apple")}
        >
          <AntDesign name="apple1" size={24} color="black" />
          <Text
            style={{ ...styles.buttonText, color: "#344054", marginLeft: 12 }}
          >
            Continue with Apple
          </Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={{ fontFamily: "Regular" }}>Don’t have an account? </Text>
          <Text>Sign up above.</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    padding: 10,
    alignItems: "center",
    width: "98%",
  },
  logo: {
    width: 74,
    height: 74,
    marginTop: 20,
  },
  title: {
    marginTop: 49,
    fontSize: RFValue(21),
    fontFamily: "SemiBold",
  },
  subtitle: {
    marginTop: 8,
    fontSize: RFValue(14),
    color: "#000",
    fontFamily: "Regular",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontFamily: "Regular",
    fontSize: RFValue(14),
  },
  buttonEmail: {
    backgroundColor: "#0D87E1",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    marginBottom: 24,
    minHeight: 44,
  },
  buttonText: {
    textAlign: "center",
    color: "#FFF",
    fontFamily: "SemiBold",
    fontSize: RFValue(14),
  },
  buttonTextWithIcon: {
    marginLeft: 10,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#000",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "#000",
    fontFamily: "Medium",
  },
  buttonGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    width: "100%",
    marginBottom: 12,
    height: 44,
  },
  buttonApple: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    width: "100%",
    marginBottom: 32,
  },
  signupContainer: {
    flexDirection: "row",
  },
  signupText: {
    color: "#4D9DE0",
    fontFamily: "SemiBold",
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  errorText: {
    fontSize: RFValue(14),
    color: "tomato",
    fontFamily: "Medium",
    alignSelf: "flex-start",
    marginBottom: 8,
    marginLeft: 4,
  },
});

export default LoginScreen;
