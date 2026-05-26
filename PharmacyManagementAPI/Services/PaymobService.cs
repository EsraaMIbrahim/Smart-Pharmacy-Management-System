using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

public class PaymobService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;


    public PaymobService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> CreatePaymentLink(decimal amount, string firstName, string lastName, string email, string phone)
    {

        // Load Paymob settings from configuration for the sake of security and flexibility
        string ApiKey = _configuration["PaymobSettings:ApiKey"];
        string BaseUrl = _configuration["PaymobSettings:BaseUrl"];
        int IntegrationId = int.Parse(_configuration["PaymobSettings:IntegrationId"]);
        string IframeId = _configuration["PaymobSettings:IframeId"];

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