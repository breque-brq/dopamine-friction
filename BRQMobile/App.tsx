import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
  StatusBar,
  BackHandler,
} from 'react-native';

/**
 * BRQ-01 Global Settings
 * SCROLL_LIMIT determines the UI informational variable, which should ideally be synced dynamically 
 * with the native Kotlin Accessibility Service property.
 */
const SCROLL_LIMIT = 50; 

function App(): React.JSX.Element {
  const [isBraking, setIsBraking] = useState(false);
  const [timer, setTimer] = useState(10);
  const [strikes, setStrikes] = useState(0);

  /**
   * Effect Hook: Native Event Listener
   * Subscribes to the 'onBrakeTrigger' event emitted by MainActivity.kt via RCTDeviceEventEmitter.
   * This decoupled communication bridges the Android Accessibility Service with our React Native UI Layer.
   */
  useEffect(() => {
    // Listen for the Native Brake Trigger
    const subscription = DeviceEventEmitter.addListener('onBrakeTrigger', (data) => {
      if (data.active) {
        startBrake();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [strikes]);

  /**
   * The core BRQ-01 Action Method.
   * Logic: 
   *  - Escalates the timer based on the user's current 'strike' count.
   *  - Toggles the UI overlay to the 'BrakeScreen' mode.
   *  - Decrements the timer interval every second until reset.
   */
  const startBrake = () => {
    if (isBraking) return;
    
    const nextDuration = strikes === 0 ? 10 : 300;
    setTimer(nextDuration);
    setIsBraking(true);

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsBraking(false);
          setStrikes((s) => s + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Effect Hook: Hardware Back Button Interception (Android-only)
   * The cornerstone of the friction UX. If the device's physical or gestural 'Back' button is pressed
   * while the dopamine-brake is active, we return 'true' to consume the event and prevent exiting the app.
   * Escaping is not allowed.
   */
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return isBraking; 
    });
    return () => backHandler.remove();
  }, [isBraking]);

  if (!isBraking) {
    return (
      <SafeAreaView style={styles.configContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <Text style={styles.title}>BRQ-01</Text>
          <Text style={styles.subtitle}>MOBILE DOPAMINE CONTROL</Text>
        </View>
        <View style={styles.content}>
          <Text style={styles.label}>LIMITE: {SCROLL_LIMIT} EVENTOS</Text>
          <Text style={styles.description}>
            A barreira será ativada automaticamente quando detectarmos o uso excessivo de scroll em redes sociais.
          </Text>
          <View style={styles.statusBox}>
              <Text style={styles.statusText}>MOTOR DE ACESSIBILIDADE: ATIVO</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.brakeOverlay}>
      <StatusBar hidden />
      <Text style={styles.brakeMessage}>
        {strikes === 0 
          ? "O SCROLL INFINITO VICIA SEU CÉREBRO EM DOPAMINA BARATA. PARE AGORA."
          : "FRICÇÃO TOTAL ATIVADA. SUA CONSCIÊNCIA PRECISA DE RESTAURAÇÃO."}
      </Text>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{timer}</Text>
      </View>
      <Text style={styles.brakeWarning}>
        {strikes === 0 ? "PRÓXIMA INTERRUPÇÃO: 5 MINUTOS." : "BLOQUEIO DE SEGURANÇA ATIVO."}
      </Text>
      <Text style={styles.footer}>BRQ-01 // ORGANIZAÇÃO BRQ</Text>
    </View>
  );
}

/**
 * BRQ-01 Design System (Brutalist UX)
 * Color Palette: Deep Black (#000000), Pure White (#FFFFFF), Alarm Red (#FF3131).
 * Typography: Use Heavy/Black weights (900) for unignorable legibility. 
 */
const styles = StyleSheet.create({
  configContainer: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 60,
  },
  title: {
    color: '#fff',
    fontSize: 64,
    fontWeight: '900',
  },
  subtitle: {
    color: '#fff',
    fontSize: 12,
    letterSpacing: 2,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
  },
  description: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.6,
    lineHeight: 20,
  },
  statusBox: {
    marginTop: 40,
    borderWidth: 2,
    borderColor: '#fff',
    padding: 20,
  },
  statusText: {
    color: '#fff',
    fontWeight: '900',
    textAlign: 'center',
  },
  brakeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    zIndex: 999,
  },
  brakeMessage: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 32,
  },
  timerContainer: {
    borderWidth: 8,
    borderColor: '#fff',
    paddingHorizontal: 40,
    paddingVertical: 20,
    marginBottom: 40,
  },
  timerText: {
    color: '#fff',
    fontSize: 100,
    fontWeight: '900',
  },
  brakeWarning: {
    color: '#FF3131',
    fontSize: 16,
    fontWeight: '900',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    color: '#fff',
    fontSize: 12,
    opacity: 0.5,
  },
});

export default App;
