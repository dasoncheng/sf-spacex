namespace viso;

public partial class MainPage : ContentPage
{
	public MainPage()
	{
		InitializeComponent();

        // Try setting the source explicitly in code-behind
        // Use Path.Combine for better path handling, although for MauiAsset simple strings usually work.
        // The key is ensuring the LogicalName in the csproj matches the path used here.
        // If using the wildcard Resources\Raw\**, the LogicalName preserves the directory structure.
        webView.Source = new UrlWebViewSource { Url = "web/index.html" };

	}
}

