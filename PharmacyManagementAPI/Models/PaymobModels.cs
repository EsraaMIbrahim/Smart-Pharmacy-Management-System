public class AuthRequest
{
    public string api_key { get; set; }
}

public class AuthResponse
{
    public string token { get; set; }
}

public class OrderRequest
{
    public string auth_token { get; set; }
    public string delivery_needed { get; set; } = "false";
    public string amount_cents { get; set; } // السعر بالقروش (مثلا 100 جنيه تكتب 10000)
    public string currency { get; set; } = "EGP";
    public string[] items { get; set; } = new string[0];
}

public class OrderResponse
{
    public int id { get; set; } // رقم الطلب اللي Paymob كريتته
}

public class BillingData
{
    public string apartment { get; set; } = "NA";
    public string email { get; set; }
    public string floor { get; set; } = "NA";
    public string first_name { get; set; }
    public string street { get; set; } = "NA";
    public string building { get; set; } = "NA";
    public string phone_number { get; set; }
    public string shipping_method { get; set; } = "NA";
    public string postal_code { get; set; } = "NA";
    public string city { get; set; } = "NA";
    public string country { get; set; } = "NA";
    public string last_name { get; set; }
    public string state { get; set; } = "NA";
}

public class PaymentKeyRequest
{
    public string auth_token { get; set; }
    public string amount_cents { get; set; }
    public int expiration { get; set; } = 3600; // صلاحية اللينك بالثواني
    public int order_id { get; set; }
    public BillingData billing_data { get; set; }
    public string currency { get; set; } = "EGP";
    public int integration_id { get; set; }
}

public class PaymentKeyResponse
{
    public string token { get; set; }
}