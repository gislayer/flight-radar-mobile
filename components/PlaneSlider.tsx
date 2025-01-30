import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from './ui/IconSymbol';

interface PlaneSliderProps {
  value: number;
  min: number; 
  max: number;
}

const PlaneSlider = ({ value, min, max }: PlaneSliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container}>
      <IconSymbol name="airplane.departure" size={20} color="#BBD686" />
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progress, { width: `${percentage}%` }]} />
          <View style={[styles.remainingProgress, { left: `${percentage}%`, right: 0 }]} />
        </View>
        
        <View style={[styles.planeIconContainer, { left: `${percentage}%` }]}>
          <IconSymbol name="airplane" size={16} color="#1e293b" />
        </View>
      </View>
      <Text style={styles.percentageText}>%{percentage.toFixed(1)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 40,
    gap: 12,
    paddingHorizontal: 4,
    marginBottom:15
  },
  arrivalIcon: {
    position: 'absolute',
    right: 0,
    transform: [{ translateX: 12 }]
  },
  progressContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative'
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'transparent',
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row'
  },
  progress: {
    height: '100%',
    backgroundColor: '#BBD686',
    borderRadius: 4
  },
  remainingProgress: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 4
  },
  planeIconContainer: {
    position: 'absolute',
    transform: [{ translateX: -8 }],
    backgroundColor: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e293b20'
  },
  percentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    width: 50,
    textAlign: 'right'
  }
});

export default PlaneSlider;

