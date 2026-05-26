using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

public class PaymobService
{
    private readonly HttpClient _httpClient;
    private const string BaseUrl = "https://accept.paymob.com/api";

    // Paymob Data
    private const string ApiKey = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRFd01qRXpPU3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5QSllJXzlWY0xwSXBTcnVPWS1LNS03Mkp0WC1PdHctb3NWbmtYQWxqcVFvNHlhUkJSMWUyLXJmQkRQOVRJR3lYZ1o1Nk5KMkFSc2lfa0FlSVBZU05WZw==";
    private const int IntegrationId = 5384372; 
    private const string IframeId = "975642"; 

    public PaymobService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<string> CreatePaymentLink(decimal amount, string firstName, string lastName, string email, string phone)
    {
        string amountCents = ((int)(amount * 100)).ToString();

        // 1. Authentication Step
        var authReq = new AuthRequest { api_key = ApiKey };
        var authContent = new StringContent(JsonSerializer.Serialize(authReq), Encoding.UTF8, "application/json");
        var authResMessage = await _httpClient.PostAsync($"{BaseUrl}/auth/tokens", authContent);

        // for debugging
        if (!authResMessage.IsSuccessStatusCode)
        {
            var errorContent = await authResMessage.Content.ReadAsStringAsync();
            throw new System.Exception($"Paymob Auth Failed! Status: {authResMessage.StatusCode}, Details: {errorContent}");
        }

        var authResData = JsonSerializer.Deserialize<AuthResponse>(await authResMessage.Content.ReadAsStringAsync());
        string authToken = authResData.token;

        // 2. Order Registration Step
        var orderReq = new OrderRequest
        {
            auth_token = authToken,
            amount_cents = amountCents,
            redirection_url = "https://localhost:7168/api/Payment/callback"
        };
        var orderContent = new StringContent(JsonSerializer.Serialize(orderReq), Encoding.UTF8, "application/json");
        var orderResMessage = await _httpClient.PostAsync($"{BaseUrl}/ecommerce/orders", orderContent);

        // debug again ya zmil!
        if (!orderResMessage.IsSuccessStatusCode)
        {
            var errorContent = await orderResMessage.Content.ReadAsStringAsync();
            throw new System.Exception($"Paymob Order Registration Failed! Status: {orderResMessage.StatusCode}, Details: {errorContent}");
        }

        var orderResData = JsonSerializer.Deserialize<OrderResponse>(await orderResMessage.Content.ReadAsStringAsync());
        int orderId = orderResData.id;

        // 3. Payment Key Generation Step
        var paymentKeyReq = new PaymentKeyRequest
        {
            auth_token = authToken,
            amount_cents = amountCents,
            order_id = orderId,
            integration_id = IntegrationId,
            billing_data = new BillingData
            {
                first_name = firstName,
                last_name = lastName,
                email = email,
                phone_number = phone
            }
        };
        var paymentContent = new StringContent(JsonSerializer.Serialize(paymentKeyReq), Encoding.UTF8, "application/json");
        var paymentResMessage = await _httpClient.PostAsync($"{BaseUrl}/acceptance/payment_keys", paymentContent);

        // debug for 3rd time ya gma3a
        if (!paymentResMessage.IsSuccessStatusCode)
        {
            var errorContent = await paymentResMessage.Content.ReadAsStringAsync();
            throw new System.Exception($"Paymob Payment Key Generation Failed! Status: {paymentResMessage.StatusCode}, Details: {errorContent}");
        }

        var paymentResData = JsonSerializer.Deserialize<PaymentKeyResponse>(await paymentResMessage.Content.ReadAsStringAsync());
        string paymentToken = paymentResData.token;

        string finalPaymentUrl = $"https://accept.paymob.com/api/acceptance/iframes/{IframeId}?payment_token={paymentToken}";

        return finalPaymentUrl;
    }
}