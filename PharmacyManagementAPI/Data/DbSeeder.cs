using PharmacyManagementAPI.Models;

namespace PharmacyManagementAPI.Data
{
    public static class DbSeeder
    {
        public static void Seed(ApiDbContext context)
        {
            var ingredientSeed = new (string Name, string TherapeuticClass)[]
            {
                ("Paracetamol",  "Analgesic-Antipyretic"),
                ("Ibuprofen",    "NSAID"),
                ("Amoxicillin",  "Penicillin-Antibiotic"),
                ("Cetirizine",   "Antihistamine"),
                ("Aspirin",      "NSAID"),
                ("Warfarin",     "Anticoagulant"),
                ("Azithromycin", "Macrolide-Antibiotic"),
                ("Atorvastatin", "Statin"),
                ("Omeprazole",   "PPI"),
                ("Metformin",    "Biguanide-Antidiabetic"),
                ("Diclofenac",   "NSAID"),
                ("Naproxen",     "NSAID"),
                ("Loratadine",   "Antihistamine"),
                ("Rosuvastatin", "Statin"),
            };

            var existingIngredients = context.Ingredients.ToList();

            foreach (var (name, therapeuticClass) in ingredientSeed)
            {
                var existing = existingIngredients.FirstOrDefault(i => i.Name == name);
                if (existing == null)
                {
                    var newIngredient = new Ingredient { Name = name, TherapeuticClass = therapeuticClass };
                    context.Ingredients.Add(newIngredient);
                    existingIngredients.Add(newIngredient);
                }
                else if (string.IsNullOrEmpty(existing.TherapeuticClass))
                {
                    existing.TherapeuticClass = therapeuticClass;
                }
            }

            context.SaveChanges();

            var ingredientByName = context.Ingredients.ToDictionary(i => i.Name, i => i.Id);

            var medicineSeed = new[]
            {
                // ── Original medicines ────────────────────────────────────────
                new { Name = "Panadol Extra",    Concentration = "500mg", Price = 45m,  BasePrice = 35m,  CostPrice = 30m,  StockQuantity = 100, ExpiryYears = 2, Category = "Painkiller",    Barcode = "100001", Ingredient = "Paracetamol"  },
                new { Name = "Brufen 400mg",     Concentration = "400mg", Price = 60m,  BasePrice = 50m,  CostPrice = 40m,  StockQuantity = 80,  ExpiryYears = 2, Category = "Painkiller",    Barcode = "100002", Ingredient = "Ibuprofen"    },
                new { Name = "Amoxil 500mg",     Concentration = "500mg", Price = 95m,  BasePrice = 80m,  CostPrice = 70m,  StockQuantity = 60,  ExpiryYears = 1, Category = "Antibiotic",    Barcode = "100003", Ingredient = "Amoxicillin"  },
                new { Name = "Zyrtec 10mg",      Concentration = "10mg",  Price = 70m,  BasePrice = 55m,  CostPrice = 45m,  StockQuantity = 75,  ExpiryYears = 2, Category = "Allergy",       Barcode = "100004", Ingredient = "Cetirizine"   },
                new { Name = "Aspirin Protect",  Concentration = "100mg", Price = 50m,  BasePrice = 40m,  CostPrice = 32m,  StockQuantity = 110, ExpiryYears = 2, Category = "Blood Thinner", Barcode = "100005", Ingredient = "Aspirin"      },
                new { Name = "Marevan 5mg",      Concentration = "5mg",   Price = 120m, BasePrice = 95m,  CostPrice = 82m,  StockQuantity = 35,  ExpiryYears = 1, Category = "Blood Thinner", Barcode = "100006", Ingredient = "Warfarin"     },
                new { Name = "Zithromax 500mg",  Concentration = "500mg", Price = 135m, BasePrice = 110m, CostPrice = 92m,  StockQuantity = 45,  ExpiryYears = 2, Category = "Antibiotic",    Barcode = "100007", Ingredient = "Azithromycin" },
                new { Name = "Lipitor 20mg",     Concentration = "20mg",  Price = 150m, BasePrice = 125m, CostPrice = 100m, StockQuantity = 55,  ExpiryYears = 2, Category = "Cholesterol",   Barcode = "100008", Ingredient = "Atorvastatin" },
                new { Name = "Losec 20mg",       Concentration = "20mg",  Price = 110m, BasePrice = 90m,  CostPrice = 75m,  StockQuantity = 40,  ExpiryYears = 2, Category = "Stomach",       Barcode = "100009", Ingredient = "Omeprazole"   },
                new { Name = "Glucophage 500mg", Concentration = "500mg", Price = 85m,  BasePrice = 70m,  CostPrice = 58m,  StockQuantity = 90,  ExpiryYears = 2, Category = "Diabetes",      Barcode = "100010", Ingredient = "Metformin"    },
                new { Name = "Voltaren 50mg",    Concentration = "50mg",  Price = 65m,  BasePrice = 52m,  CostPrice = 42m,  StockQuantity = 70,  ExpiryYears = 2, Category = "Painkiller",    Barcode = "100011", Ingredient = "Diclofenac"   },
                new { Name = "Naprosyn 500mg",   Concentration = "500mg", Price = 72m,  BasePrice = 58m,  CostPrice = 47m,  StockQuantity = 65,  ExpiryYears = 2, Category = "Painkiller",    Barcode = "100012", Ingredient = "Naproxen"     },
                new { Name = "Claritine 10mg",   Concentration = "10mg",  Price = 75m,  BasePrice = 60m,  CostPrice = 48m,  StockQuantity = 80,  ExpiryYears = 2, Category = "Allergy",       Barcode = "100013", Ingredient = "Loratadine"   },
                new { Name = "Crestor 10mg",     Concentration = "10mg",  Price = 165m, BasePrice = 138m, CostPrice = 112m, StockQuantity = 45,  ExpiryYears = 2, Category = "Cholesterol",   Barcode = "100014", Ingredient = "Rosuvastatin" },

                // ── Phase 4: Generic brands for L1 (Bio-Equivalent) ──────────
                // Same Ingredient + same Concentration as an existing brand →
                // appears as L1 when pharmacist searches for the branded version.
                new { Name = "Adol 500mg",               Concentration = "500mg", Price = 40m, BasePrice = 30m, CostPrice = 25m, StockQuantity = 120, ExpiryYears = 2, Category = "Painkiller", Barcode = "100015", Ingredient = "Paracetamol"  },
                new { Name = "Ibufen 400mg",             Concentration = "400mg", Price = 52m, BasePrice = 42m, CostPrice = 35m, StockQuantity = 95,  ExpiryYears = 2, Category = "Painkiller", Barcode = "100016", Ingredient = "Ibuprofen"    },
                new { Name = "Amoxicillin EIPICO 500mg", Concentration = "500mg", Price = 80m, BasePrice = 65m, CostPrice = 55m, StockQuantity = 70,  ExpiryYears = 1, Category = "Antibiotic", Barcode = "100017", Ingredient = "Amoxicillin"  },
            };

            var existingMedicineNames = context.Medicines.Select(m => m.Name).ToHashSet();

            foreach (var m in medicineSeed)
            {
                if (existingMedicineNames.Contains(m.Name))
                    continue;

                context.Medicines.Add(new Medicine
                {
                    Name = m.Name,
                    Concentration = m.Concentration,
                    Price = m.Price,
                    BasePrice = m.BasePrice,
                    CostPrice = m.CostPrice,
                    StockQuantity = m.StockQuantity,
                    ExpiryDate = DateTime.Now.AddYears(m.ExpiryYears),
                    Category = m.Category,
                    Barcode = m.Barcode,
                    IsActive = true,
                    IngredientId = ingredientByName[m.Ingredient]
                });
            }

            context.SaveChanges();

            // ── Backfill Concentration on existing medicines ──────────────────
            // Handles the case where medicines were seeded before the Concentration
            // column was added — sets the value without touching anything else.
            var concentrationMap = new Dictionary<string, string>
            {
                { "Panadol Extra",    "500mg" },
                { "Brufen 400mg",     "400mg" },
                { "Amoxil 500mg",     "500mg" },
                { "Zyrtec 10mg",      "10mg"  },
                { "Aspirin Protect",  "100mg" },
                { "Marevan 5mg",      "5mg"   },
                { "Zithromax 500mg",  "500mg" },
                { "Lipitor 20mg",     "20mg"  },
                { "Losec 20mg",       "20mg"  },
                { "Glucophage 500mg", "500mg" },
                { "Voltaren 50mg",    "50mg"  },
                { "Naprosyn 500mg",   "500mg" },
                { "Claritine 10mg",   "10mg"  },
                { "Crestor 10mg",     "10mg"  },
            };

            var medicinesToPatch = context.Medicines
                .Where(m => m.Concentration == null && concentrationMap.Keys.Contains(m.Name))
                .ToList();

            foreach (var med in medicinesToPatch)
            {
                if (concentrationMap.TryGetValue(med.Name, out var conc))
                    med.Concentration = conc;
            }

            context.SaveChanges();

            var medicineByName = context.Medicines.ToDictionary(m => m.Name, m => m.Id);

            var interactionSeed = new[]
            {
                new { A = "Aspirin",      B = "Warfarin",     Severity = "High",   Warning = "Aspirin and Warfarin together may increase bleeding risk." },
                new { A = "Ibuprofen",    B = "Warfarin",     Severity = "High",   Warning = "Ibuprofen and Warfarin together may increase bleeding risk." },
                new { A = "Ibuprofen",    B = "Aspirin",      Severity = "Medium", Warning = "Ibuprofen and Aspirin together may increase stomach bleeding or irritation." },
                new { A = "Azithromycin", B = "Atorvastatin", Severity = "Medium", Warning = "Azithromycin with Atorvastatin may increase muscle pain or weakness risk." },
                new { A = "Amoxicillin",  B = "Warfarin",     Severity = "Low",    Warning = "Amoxicillin with Warfarin may require monitoring for bleeding risk." },
                new { A = "Diclofenac",   B = "Warfarin",     Severity = "High",   Warning = "Diclofenac and Warfarin together significantly increase bleeding risk." },
                new { A = "Naproxen",     B = "Warfarin",     Severity = "High",   Warning = "Naproxen and Warfarin together significantly increase bleeding risk." },
            };

            var existingPairs = context.DrugInteractions
                .Select(di => new { di.Ingredient1Id, di.Ingredient2Id })
                .ToHashSet();

            foreach (var i in interactionSeed)
            {
                var id1 = ingredientByName[i.A];
                var id2 = ingredientByName[i.B];

                bool alreadyExists = existingPairs.Any(p =>
                    (p.Ingredient1Id == id1 && p.Ingredient2Id == id2) ||
                    (p.Ingredient1Id == id2 && p.Ingredient2Id == id1));

                if (alreadyExists) continue;

                context.DrugInteractions.Add(new DrugInteraction
                {
                    Ingredient1Id = id1,
                    Ingredient2Id = id2,
                    Severity = i.Severity,
                    WarningMessage = i.Warning
                });
            }

            context.SaveChanges();

            if (!context.Patients.Any())
            {
                context.Patients.AddRange(
                    new Patient { FullName = "Ahmed Mohamed", PhoneNumber = "01012345678", Email = "ahmed@gmail.com", TotalSpent = 250, IsActive = true, CreatedAt = DateTime.Now },
                    new Patient { FullName = "Sara Ali", PhoneNumber = "01098765432", Email = "sara@gmail.com", TotalSpent = 430, IsActive = true, CreatedAt = DateTime.Now },
                    new Patient { FullName = "Omar Hassan", PhoneNumber = "01155554444", Email = "omar@gmail.com", TotalSpent = 125, IsActive = true, CreatedAt = DateTime.Now },
                    new Patient { FullName = "Nour Tarek", PhoneNumber = "01222223333", Email = "nour@gmail.com", TotalSpent = 610, IsActive = true, CreatedAt = DateTime.Now },
                    new Patient { FullName = "Walk-in Customer", PhoneNumber = "0000000000", Email = null, TotalSpent = 0, IsActive = true, CreatedAt = DateTime.Now }
                );
            }
            else if (!context.Patients.Any(p => p.PhoneNumber == "0000000000"))
            {
                context.Patients.Add(
                    new Patient { FullName = "Walk-in Customer", PhoneNumber = "0000000000", Email = null, TotalSpent = 0, IsActive = true, CreatedAt = DateTime.Now }
                );
            }

            if (!context.Users.Any())
            {
                context.Users.AddRange(
                    new User { Username = "admin", PasswordHash = "admin123", Role = "Admin", FullName = "System Admin", PhoneNumber = "01000000001" },
                    new User { Username = "pharmacist", PasswordHash = "pharmacist123", Role = "Pharmacist", FullName = "System Pharmacist", PhoneNumber = "01000000002" },
                    new User { Username = "staff", PasswordHash = "staff123", Role = "Staff", FullName = "System Staff", PhoneNumber = "01000000003" },
                    new User { Username = "client", PasswordHash = "client123", Role = "Client", FullName = "System Client", PhoneNumber = "01000000004" }
                );
            }

            if (!context.Suppliers.Any())
            {
                context.Suppliers.AddRange(
                    new Supplier { Name = "El Ezaby Pharma", ContactPerson = "Ahmed Samir", Phone = "01010101010", Email = "ezaby@gmail.com", Address = "Cairo", IsActive = true },
                    new Supplier { Name = "Seif Medical", ContactPerson = "Mona Adel", Phone = "01020202020", Email = "seif@gmail.com", Address = "Alexandria", IsActive = true },
                    new Supplier { Name = "Nile Pharma", ContactPerson = "Karim Hassan", Phone = "01030303030", Email = "nile@gmail.com", Address = "Giza", IsActive = true }
                );
            }

            context.SaveChanges();

            if (!context.PurchaseOrders.Any())
            {
                context.PurchaseOrders.AddRange(
                    new PurchaseOrder { MedicineId = medicineByName["Panadol Extra"], SupplierId = 1, QuantityReceived = 50, CostPrice = 30, OrderDate = DateTime.Now },
                    new PurchaseOrder { MedicineId = medicineByName["Brufen 400mg"], SupplierId = 1, QuantityReceived = 40, CostPrice = 40, OrderDate = DateTime.Now },
                    new PurchaseOrder { MedicineId = medicineByName["Amoxil 500mg"], SupplierId = 2, QuantityReceived = 30, CostPrice = 70, OrderDate = DateTime.Now }
                );
            }

            if (!context.PurchaseHistories.Any())
            {
                context.PurchaseHistories.AddRange(
                    new PurchaseHistories { MedicineId = medicineByName["Panadol Extra"], PatientId = 1, MedicineName = "Panadol Extra", Quantity = 2, TotalPrice = 90, PurchaseDate = DateTime.Now },
                    new PurchaseHistories { MedicineId = medicineByName["Brufen 400mg"], PatientId = 2, MedicineName = "Brufen 400mg", Quantity = 1, TotalPrice = 60, PurchaseDate = DateTime.Now },
                    new PurchaseHistories { MedicineId = medicineByName["Amoxil 500mg"], PatientId = 3, MedicineName = "Amoxil 500mg", Quantity = 1, TotalPrice = 95, PurchaseDate = DateTime.Now }
                );
            }

            if (!context.OnlineOrders.Any())
            {
                context.OnlineOrders.AddRange(
                    new OnlineOrder { UserId = 4, MedicineId = medicineByName["Panadol Extra"], MedicineName = "Panadol Extra", Quantity = 2, TotalPrice = 90, OrderDate = DateTime.Now, ShippingAddress = "Nasr City, Cairo", PaymentMethod = "Cash", Status = "Pending" },
                    new OnlineOrder { UserId = 4, MedicineId = medicineByName["Amoxil 500mg"], MedicineName = "Amoxil 500mg", Quantity = 1, TotalPrice = 95, OrderDate = DateTime.Now, ShippingAddress = "Dokki, Giza", PaymentMethod = "Visa", Status = "Delivered" }
                );
            }

            context.SaveChanges();
        }
    }
}