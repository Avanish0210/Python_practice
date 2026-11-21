class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks

    def get_avg(self):
        avg = sum(self.makrs)/len(self.marks)
        print(self.name , "average" , avg)

s1 = Student("Arpita" , [99,88,90])
s1.get_avg()