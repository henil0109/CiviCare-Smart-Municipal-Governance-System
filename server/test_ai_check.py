from ai_module import predict_category

test_cases = [
    "light streets not working",
    "street light not working",
    "traffic light stuck",
    "pothole on the main road",
    "big pothole", 
    "water leaking from pipe",
    "garbage overflow in bin",
    "traffic signal stuck red",
    "bad smell coming from drain"
]

print(f"{'Description':<30} | {'Category'}")
print("-" * 50)

for desc in test_cases:
    cat = predict_category(desc)
    print(f"{desc:<30} | {cat}")
