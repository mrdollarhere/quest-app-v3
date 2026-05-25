/**
 * DNTRNG™ Assessment Configuration Registry
 * 
 * Contains standardized thresholds, messages, and diagnostic metadata.
 */

export interface Verdict {
  title: string;
  message: string;
  color: string;
  border: string;
  bg: string;
  iconName: 'Trophy' | 'CheckCircle2' | 'Target' | 'XCircle';
}

export const getVerdictData = (pct: number): Verdict => {
  if (pct >= 90) return { 
    title: "Excellent! You mastered this topic. / Xuất sắc! Bạn đã nắm vững chủ đề này.",
    message: "Outstanding performance! You have successfully completed this assessment. / Kết quả thật tuyệt vời! Bạn đã hoàn thành xuất sắc bài kiểm tra này.", 
    color: "text-emerald-600",
    border: "border-emerald-500",
    bg: "bg-emerald-50",
    iconName: 'Trophy'
  };
  if (pct >= 75) return { 
    title: "Well done! A few things to review. / Làm tốt lắm! Có một vài điểm cần xem lại.",
    message: "Strong performance! Review the questions you missed to improve further. / Kết quả rất tốt! Hãy xem lại các câu sai để hoàn thiện hơn nhé.", 
    color: "text-blue-600",
    border: "border-blue-500",
    bg: "bg-blue-50",
    iconName: 'CheckCircle2'
  };
  if (pct >= 50) return { 
    title: "Good effort. Keep practicing! / Cố gắng tốt. Hãy tiếp tục luyện tập!",
    message: "You are making progress. Check the answers below to see where you can improve. / Bạn đang tiến bộ đấy. Hãy xem đáp án bên dưới để biết điểm cần cải thiện.", 
    color: "text-amber-600",
    border: "border-amber-500",
    bg: "bg-amber-50",
    iconName: 'Target'
  };
  return { 
    title: "Keep going. Review and try again. / Tiếp tục nào. Xem lại bài và thử lại.",
    message: "Practice makes perfect! Review the materials and try the test again. / Luyện tập nhiều sẽ thành công! Hãy xem lại bài và thử làm lại nhé.", 
    color: "text-rose-600",
    border: "border-rose-500",
    bg: "bg-rose-50",
    iconName: 'XCircle'
  };
};
