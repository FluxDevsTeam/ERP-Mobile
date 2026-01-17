import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface Props {
  currentPage: number;
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  totalCount?: number;
}

export default function PaginationControl({ currentPage, hasNext, hasPrev, onNext, onPrev, totalCount }: Props) {
  return (
    <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-slate-100">
      <Text className="text-sm text-[#64748B]">
        Page {currentPage} {totalCount ? `of ~${Math.ceil(totalCount / 10)}` : ''}
      </Text>
      
      <View className="flex-row gap-x-2">
        <TouchableOpacity 
          onPress={onPrev}
          disabled={!hasPrev}
          className={`border border-slate-300 rounded-lg px-3 py-1.5 flex-row items-center ${!hasPrev ? 'opacity-50' : ''}`}
        >
          <ChevronLeft size={16} color="#334155" />
          <Text className="text-sm font-semibold text-[#334155] ml-1">Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onNext}
          disabled={!hasNext}
          className={`border border-slate-300 rounded-lg px-3 py-1.5 flex-row items-center ${!hasNext ? 'opacity-50' : ''}`}
        >
          <Text className="text-sm font-semibold text-[#334155] mr-1">Next</Text>
          <ChevronRight size={16} color="#334155" />
        </TouchableOpacity>
      </View>
    </View>
  );
}