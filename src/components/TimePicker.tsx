import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../constants/colors';

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 3;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

type TimePickerProps = {
  value: Date;
  onChange: (date: Date) => void;
};

export default function TimePicker({ value, onChange }: TimePickerProps) {
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const ampmOptions = ['AM', 'PM'];

  const [selectedHour, setSelectedHour] = useState(value.getHours() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(value.getMinutes());
  const [selectedAmPm, setSelectedAmPm] = useState(value.getHours() >= 12 ? 'PM' : 'AM');

  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);
  const ampmScrollRef = useRef<ScrollView>(null);

  // Update parent when selection changes
  useEffect(() => {
    const newDate = new Date(value);
    let hour24 = selectedHour;
    if (selectedAmPm === 'PM' && selectedHour !== 12) {
      hour24 = selectedHour + 12;
    } else if (selectedAmPm === 'AM' && selectedHour === 12) {
      hour24 = 0;
    }
    newDate.setHours(hour24);
    newDate.setMinutes(selectedMinute);
    onChange(newDate);
  }, [selectedHour, selectedMinute, selectedAmPm]);

  // Initialize scroll positions on mount
  useEffect(() => {
    const hour = value.getHours() % 12 || 12;
    const minute = value.getMinutes();
    const ampm = value.getHours() >= 12 ? 'PM' : 'AM';

    setTimeout(() => {
      scrollToIndex(hourScrollRef, hours.indexOf(hour));
      scrollToIndex(minuteScrollRef, minutes.indexOf(minute));
      scrollToIndex(ampmScrollRef, ampmOptions.indexOf(ampm));
    }, 100);
  }, []);

  // Sync scroll position when value prop changes externally
  useEffect(() => {
    const hour = value.getHours() % 12 || 12;
    const minute = value.getMinutes();
    const ampm = value.getHours() >= 12 ? 'PM' : 'AM';

    if (hour !== selectedHour || minute !== selectedMinute || ampm !== selectedAmPm) {
      setSelectedHour(hour);
      setSelectedMinute(minute);
      setSelectedAmPm(ampm);
      setTimeout(() => {
        scrollToIndex(hourScrollRef, hours.indexOf(hour));
        scrollToIndex(minuteScrollRef, minutes.indexOf(minute));
        scrollToIndex(ampmScrollRef, ampmOptions.indexOf(ampm));
      }, 50);
    }
  }, [value]);

  const scrollToIndex = (ref: React.RefObject<ScrollView | null>, index: number) => {
    ref.current?.scrollTo({
      y: index * ITEM_HEIGHT,
      animated: true,
    });
  };

  const handleScroll = (
    ref: React.RefObject<ScrollView | null>,
    items: (string | number)[],
    setter: (value: any) => void
  ) => {
    return (event: any) => {
      const y = event.nativeEvent.contentOffset.y;
      const index = Math.round(y / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      setter(items[clampedIndex]);
    };
  };

  const renderPickerColumn = (
    items: (string | number)[],
    selectedValue: string | number,
    onScroll: (event: any) => void,
    ref: React.RefObject<ScrollView | null>,
    formatValue: (item: string | number) => string = (item) => String(item).padStart(2, '0')
  ) => {
    const paddingTop = ITEM_HEIGHT * 1;
    const paddingBottom = ITEM_HEIGHT * 1;

    return (
      <ScrollView
        ref={ref}
        style={styles.pickerColumn}
        contentContainerStyle={{
          paddingTop,
          paddingBottom,
        }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={onScroll}
        onScrollEndDrag={onScroll}
        bounces={false}
      >
        {items.map((item, index) => {
          const isSelected = item === selectedValue;
          const selectedIndex = items.indexOf(selectedValue);
          const distance = Math.abs(selectedIndex - index);
          
          // Subtle fade for non-selected items - more refined
          const opacity = distance === 0 ? 1 : Math.max(0.35, 1 - distance * 0.2);
          const scale = distance === 0 ? 1 : Math.max(0.92, 1 - distance * 0.03);
          
          return (
            <View 
              key={index} 
              style={[
                styles.pickerItem, 
                { height: ITEM_HEIGHT },
              ]}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  isSelected && styles.pickerItemTextSelected,
                  { opacity, transform: [{ scale }] },
                ]}
              >
                {formatValue(item)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Selection highlight overlay */}
      <View style={styles.selectionOverlay} pointerEvents="none">
        <View style={styles.selectionHighlight} />
      </View>

      <View style={styles.pickerWrapper}>
        {/* Hour Column */}
        <View style={styles.column}>
          {renderPickerColumn(
            hours,
            selectedHour,
            handleScroll(hourScrollRef, hours, setSelectedHour),
            hourScrollRef
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Minute Column */}
        <View style={styles.column}>
          {renderPickerColumn(
            minutes,
            selectedMinute,
            handleScroll(minuteScrollRef, minutes, setSelectedMinute),
            minuteScrollRef
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* AM/PM Column */}
        <View style={styles.column}>
          {renderPickerColumn(
            ampmOptions,
            selectedAmPm,
            handleScroll(ampmScrollRef, ampmOptions, setSelectedAmPm),
            ampmScrollRef,
            (item) => String(item)
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: PICKER_HEIGHT,
    position: 'relative',
    backgroundColor: colors.bgCard,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  pickerWrapper: {
    flexDirection: 'row',
    height: PICKER_HEIGHT,
  },
  column: {
    flex: 1,
    position: 'relative',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 17,
    color: colors.textSecondary,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  pickerItemTextSelected: {
    fontSize: 20,
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  selectionHighlight: {
    height: ITEM_HEIGHT,
    width: '100%',
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
});
