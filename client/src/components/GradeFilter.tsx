import { Button } from "@/components/ui/button";

interface GradeFilterProps {
  selectedGrade: number | null;
  onGradeChange: (grade: number | null) => void;
}

const GradeFilter = ({ selectedGrade, onGradeChange }: GradeFilterProps) => {
  const grades = [null, 9, 10, 11, 12];
  
  return (
    <div className="filter-section bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold mb-3 text-primary font-sans">Filter Candidates</h3>
      <div className="flex flex-wrap gap-2">
        {grades.map((grade) => (
          <Button
            key={grade === null ? "all" : grade}
            variant={selectedGrade === grade ? "default" : "outline"}
            onClick={() => onGradeChange(grade)}
            className={`py-1 px-4 rounded-full text-sm font-sans ${
              selectedGrade === grade 
                ? "bg-primary text-white" 
                : "bg-white border border-primary text-primary hover:text-primary hover:bg-white/80"
            }`}
          >
            {grade === null ? "All Grades" : `Grade ${grade}`}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default GradeFilter;
