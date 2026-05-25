using PharmacyManagementAPI.Models;

namespace PharmacyManagementAPI.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApiDbContext context)
        {
            if (context.Medicines.Any())
                return;

            // ── Ingredients ──
            var ingredients = new List<Ingredient>
            {
                new() { Name = "Paracetamol",    TherapeuticClass = "Analgesic-Antipyretic" }, // 0
                new() { Name = "Ibuprofen",      TherapeuticClass = "NSAID" },                  // 1
                new() { Name = "Amoxicillin",    TherapeuticClass = "Penicillin-Antibiotic" },  // 2
                new() { Name = "Cetirizine",     TherapeuticClass = "Antihistamine" },          // 3
                new() { Name = "Aspirin",        TherapeuticClass = "NSAID" },                  // 4
                new() { Name = "Warfarin",       TherapeuticClass = "Anticoagulant" },          // 5
                new() { Name = "Azithromycin",   TherapeuticClass = "Macrolide-Antibiotic" },   // 6
                new() { Name = "Atorvastatin",   TherapeuticClass = "Statin" },                 // 7
                new() { Name = "Omeprazole",     TherapeuticClass = "PPI" },                    // 8
                new() { Name = "Metformin",      TherapeuticClass = "Biguanide-Antidiabetic" }, // 9
                new() { Name = "Diclofenac",     TherapeuticClass = "NSAID" },                  // 10
                new() { Name = "Naproxen",       TherapeuticClass = "NSAID" },                  // 11
                new() { Name = "Loratadine",     TherapeuticClass = "Antihistamine" },          // 12
                new() { Name = "Rosuvastatin",   TherapeuticClass = "Statin" },                 // 13
            };

            context.Ingredients.AddRange(ingredients);
            context.SaveChanges();

            // ── Medicines ──
            var medicines = new List<Medicine>
            {
                new() { Name = "Panadol Extra",    Price = 45,  BasePrice = 35,  CostPrice = 30,  StockQuantity = 100, ExpiryDate = DateTime.Now.AddYears(2), Category = "Painkiller",    Barcode = "100001", IsActive = true, IngredientId = ingredients[0].Id },
                new() { Name = "Brufen 400mg",     Price = 60,  BasePrice = 50,  CostPrice = 40,  StockQuantity = 80,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Painkiller",    Barcode = "100002", IsActive = true, IngredientId = ingredients[1].Id },
                new() { Name = "Amoxil 500mg",     Price = 95,  BasePrice = 80,  CostPrice = 70,  StockQuantity = 60,  ExpiryDate = DateTime.Now.AddYears(1), Category = "Antibiotic",    Barcode = "100003", IsActive = true, IngredientId = ingredients[2].Id },
                new() { Name = "Zyrtec 10mg",      Price = 70,  BasePrice = 55,  CostPrice = 45,  StockQuantity = 75,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Allergy",       Barcode = "100004", IsActive = true, IngredientId = ingredients[3].Id },
                new() { Name = "Aspirin Protect",  Price = 50,  BasePrice = 40,  CostPrice = 32,  StockQuantity = 110, ExpiryDate = DateTime.Now.AddYears(2), Category = "Blood Thinner", Barcode = "100005", IsActive = true, IngredientId = ingredients[4].Id },
                new() { Name = "Marevan 5mg",      Price = 120, BasePrice = 95,  CostPrice = 82,  StockQuantity = 35,  ExpiryDate = DateTime.Now.AddYears(1), Category = "Blood Thinner", Barcode = "100006", IsActive = true, IngredientId = ingredients[5].Id },
                new() { Name = "Zithromax 500mg",  Price = 135, BasePrice = 110, CostPrice = 92,  StockQuantity = 45,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Antibiotic",    Barcode = "100007", IsActive = true, IngredientId = ingredients[6].Id },
                new() { Name = "Lipitor 20mg",     Price = 150, BasePrice = 125, CostPrice = 100, StockQuantity = 55,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Cholesterol",   Barcode = "100008", IsActive = true, IngredientId = ingredients[7].Id },
                new() { Name = "Losec 20mg",       Price = 110, BasePrice = 90,  CostPrice = 75,  StockQuantity = 40,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Stomach",       Barcode = "100009", IsActive = true, IngredientId = ingredients[8].Id },
                new() { Name = "Glucophage 500mg", Price = 85,  BasePrice = 70,  CostPrice = 58,  StockQuantity = 90,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Diabetes",      Barcode = "100010", IsActive = true, IngredientId = ingredients[9].Id },
                // additions — enable Level 3 class-match demo data
                new() { Name = "Voltaren 50mg",    Price = 65,  BasePrice = 52,  CostPrice = 42,  StockQuantity = 70,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Painkiller",    Barcode = "100011", IsActive = true, IngredientId = ingredients[10].Id },
                new() { Name = "Naprosyn 500mg",   Price = 72,  BasePrice = 58,  CostPrice = 47,  StockQuantity = 65,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Painkiller",    Barcode = "100012", IsActive = true, IngredientId = ingredients[11].Id },
                new() { Name = "Claritine 10mg",   Price = 75,  BasePrice = 60,  CostPrice = 48,  StockQuantity = 80,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Allergy",       Barcode = "100013", IsActive = true, IngredientId = ingredients[12].Id },
                new() { Name = "Crestor 10mg",     Price = 165, BasePrice = 138, CostPrice = 112, StockQuantity = 45,  ExpiryDate = DateTime.Now.AddYears(2), Category = "Cholesterol",   Barcode = "100014", IsActive = true, IngredientId = ingredients[13].Id },
            };

            context.Medicines.AddRange(medicines);

            // ── DrugInteractions (using IngredientIds, as per existing schema) ──
            context.DrugInteractions.AddRange(
                new DrugInteraction { Ingredient1Id = ingredients[4].Id, Ingredient2Id = ingredients[5].Id, Severity = "High", WarningMessage = "Aspirin and Warfarin together may increase bleeding risk." },
                new DrugInteraction { Ingredient1Id = ingredients[1].Id, Ingredient2Id = ingredients[5].Id, Severity = "High", WarningMessage = "Ibuprofen and Warfarin together may increase bleeding risk." },
                new DrugInteraction { Ingredient1Id = ingredients[1].Id, Ingredient2Id = ingredients[4].Id, Severity = "Medium", WarningMessage = "Ibuprofen and Aspirin together may increase stomach bleeding or irritation." },
                new DrugInteraction { Ingredient1Id = ingredients[6].Id, Ingredient2Id = ingredients[7].Id, Severity = "Medium", WarningMessage = "Azithromycin with Atorvastatin may increase muscle pain or weakness risk." },
                new DrugInteraction { Ingredient1Id = ingredients[2].Id, Ingredient2Id = ingredients[5].Id, Severity = "Low", WarningMessage = "Amoxicillin with Warfarin may require monitoring for bleeding risk." },
                // additions — NSAID cross-interactions (visible in N-tier scan)
                new DrugInteraction { Ingredient1Id = ingredients[10].Id, Ingredient2Id = ingredients[5].Id, Severity = "High", WarningMessage = "Diclofenac and Warfarin together significantly increase bleeding risk." },
                new DrugInteraction { Ingredient1Id = ingredients[11].Id, Ingredient2Id = ingredients[5].Id, Severity = "High", WarningMessage = "Naproxen and Warfarin together significantly increase bleeding risk." }
            );

            context.Patients.AddRange(
                new Patient { FullName = "Ahmed Mohamed", PhoneNumber = "01012345678", Email = "ahmed@gmail.com", TotalSpent = 250, IsActive = true, CreatedAt = DateTime.Now },
                new Patient { FullName = "Sara Ali", PhoneNumber = "01098765432", Email = "sara@gmail.com", TotalSpent = 430, IsActive = true, CreatedAt = DateTime.Now },
                new Patient { FullName = "Omar Hassan", PhoneNumber = "01155554444", Email = "omar@gmail.com", TotalSpent = 125, IsActive = true, CreatedAt = DateTime.Now },
                new Patient { FullName = "Nour Tarek", PhoneNumber = "01222223333", Email = "nour@gmail.com", TotalSpent = 610, IsActive = true, CreatedAt = DateTime.Now }
            );

            context.Users.AddRange(
                new User { Username = "admin", PasswordHash = "admin123", Role = "Admin", FullName = "System Admin", PhoneNumber = "01000000001" },
                new User { Username = "pharmacist", PasswordHash = "pharmacist123", Role = "Pharmacist", FullName = "System Pharmacist", PhoneNumber = "01000000002" },
                new User { Username = "staff", PasswordHash = "staff123", Role = "Staff", FullName = "System Staff", PhoneNumber = "01000000003" },
                new User { Username = "client", PasswordHash = "client123", Role = "Client", FullName = "System Client", PhoneNumber = "01000000004" }
            );

            context.Suppliers.AddRange(
                new Supplier { Name = "El Ezaby Pharma", ContactPerson = "Ahmed Samir", Phone = "01010101010", Email = "ezaby@gmail.com", Address = "Cairo", IsActive = true },
                new Supplier { Name = "Seif Medical", ContactPerson = "Mona Adel", Phone = "01020202020", Email = "seif@gmail.com", Address = "Alexandria", IsActive = true },
                new Supplier { Name = "Nile Pharma", ContactPerson = "Karim Hassan", Phone = "01030303030", Email = "nile@gmail.com", Address = "Giza", IsActive = true }
            );

            context.SaveChanges();

            context.PurchaseOrders.AddRange(
                new PurchaseOrder { MedicineId = medicines[0].Id, SupplierId = 1, QuantityReceived = 50, CostPrice = 30, OrderDate = DateTime.Now },
                new PurchaseOrder { MedicineId = medicines[1].Id, SupplierId = 1, QuantityReceived = 40, CostPrice = 40, OrderDate = DateTime.Now },
                new PurchaseOrder { MedicineId = medicines[2].Id, SupplierId = 2, QuantityReceived = 30, CostPrice = 70, OrderDate = DateTime.Now }
            );

            context.PurchaseHistories.AddRange(
                new PurchaseHistories { MedicineId = medicines[0].Id, PatientId = 1, MedicineName = "Panadol Extra", Quantity = 2, TotalPrice = 90, PurchaseDate = DateTime.Now },
                new PurchaseHistories { MedicineId = medicines[1].Id, PatientId = 2, MedicineName = "Brufen 400mg", Quantity = 1, TotalPrice = 60, PurchaseDate = DateTime.Now },
                new PurchaseHistories { MedicineId = medicines[2].Id, PatientId = 3, MedicineName = "Amoxil 500mg", Quantity = 1, TotalPrice = 95, PurchaseDate = DateTime.Now }
            );

            context.OnlineOrders.AddRange(
                new OnlineOrder { UserId = 4, MedicineId = medicines[0].Id, MedicineName = "Panadol Extra", Quantity = 2, TotalPrice = 90, OrderDate = DateTime.Now, ShippingAddress = "Nasr City, Cairo", PaymentMethod = "Cash", Status = "Pending" },
                new OnlineOrder { UserId = 4, MedicineId = medicines[2].Id, MedicineName = "Amoxil 500mg", Quantity = 1, TotalPrice = 95, OrderDate = DateTime.Now, ShippingAddress = "Dokki, Giza", PaymentMethod = "Visa", Status = "Delivered" }
            );

            context.SaveChanges();
        }
    }
}