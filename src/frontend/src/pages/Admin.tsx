import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { Package, Plus, Shield, Trash2, Upload } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { RARITY_CONFIG } from "../data/seedData";
import {
  type Ad,
  useAddAd,
  useAddShopItem,
  useAddWaifuCharacter,
  useAds,
  useDeleteAd,
  useDeleteWaifuCharacter,
  useShopItems,
  useWaifuCharacters,
} from "../hooks/useQueries";

const ADMIN_USERNAME = "OwnerSween";
const ADMIN_PASSWORD = "7864owner";

interface AdminProps {
  onNavigate?: (page: string) => void;
}

export default function Admin({ onNavigate }: AdminProps) {
  const { data: characters } = useWaifuCharacters();
  const { data: shopItems } = useShopItems();
  const { data: ads } = useAds();
  const addWaifu = useAddWaifuCharacter();
  const addShopItem = useAddShopItem();
  const deleteWaifu = useDeleteWaifuCharacter();
  const addAd = useAddAd();
  const deleteAd = useDeleteAd();

  const queryClient = useQueryClient();
  const [unlocked, setUnlocked] = useState(false);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const [waifuForm, setWaifuForm] = useState({
    name: "",
    series: "",
    rarity: "common",
    imageUrl: "",
  });

  const [shopForm, setShopForm] = useState({
    name: "",
    description: "",
    itemType: "ticket",
    price: "",
  });

  const [adForm, setAdForm] = useState({
    title: "",
    imageUrl: "",
    videoUrl: "",
    link: "",
  });

  const handleLogin = () => {
    if (loginUsername === ADMIN_USERNAME && loginPassword === ADMIN_PASSWORD) {
      setUnlocked(true);
      setLoginError("");
      localStorage.setItem("sinzhu_admin_unlocked", "true");
      toast.success("Admin panel unlocked!");
    } else {
      setLoginError("Wrong username or password.");
    }
  };

  if (!unlocked) {
    return (
      <main
        className="max-w-sm mx-auto px-4 py-16 text-center"
        data-ocid="admin.section"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-5"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "#1c2f45", border: "1px solid #2b5278" }}
          >
            <Shield className="w-8 h-8" style={{ color: "#5288c1" }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "#e8f4fd" }}>
              Admin Panel
            </h2>
            <p className="text-sm mt-1" style={{ color: "#8eacbb" }}>
              Enter your credentials to continue
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: "#182533",
                color: "#e8f4fd",
                border: "1px solid #2b3d54",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              data-ocid="admin.login_username.input"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: "#182533",
                color: "#e8f4fd",
                border: loginError ? "1px solid #e05c6a" : "1px solid #2b3d54",
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              data-ocid="admin.login_password.input"
            />
            {loginError && (
              <p className="text-sm" style={{ color: "#e05c6a" }}>
                {loginError}
              </p>
            )}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full py-2.5 rounded-xl font-bold text-white transition-all hover:brightness-110"
              style={{ background: "#5288c1" }}
              data-ocid="admin.login.submit_button"
            >
              Unlock Admin Panel
            </button>
          </div>
        </motion.div>
      </main>
    );
  }

  const handleAddWaifu = async () => {
    if (!waifuForm.name || !waifuForm.imageUrl) {
      toast.error("Name and Photo URL are required!");
      return;
    }
    const newWaifu = {
      id: `waifu-${Date.now()}`,
      name: waifuForm.name,
      series: waifuForm.series || "Unknown",
      rarity: waifuForm.rarity,
      imageUrl: waifuForm.imageUrl,
    };
    // Always save to localStorage first
    const existing = JSON.parse(localStorage.getItem("sinzhu_waifus") || "[]");
    existing.push(newWaifu);
    localStorage.setItem("sinzhu_waifus", JSON.stringify(existing));
    // Immediately refresh UI from localStorage
    queryClient.invalidateQueries({ queryKey: ["waifuCharacters"] });
    try {
      await addWaifu.mutateAsync(newWaifu);
    } catch {
      // localStorage already saved and query refreshed
    }
    toast.success(`Waifu "${waifuForm.name}" added! ✅`);
    setWaifuForm({ name: "", series: "", rarity: "common", imageUrl: "" });
  };

  const handleDeleteWaifu = async (id: string, name: string) => {
    // Remove from localStorage immediately
    const existing = JSON.parse(localStorage.getItem("sinzhu_waifus") || "[]");
    const filtered = existing.filter((w: { id: string }) => w.id !== id);
    localStorage.setItem("sinzhu_waifus", JSON.stringify(filtered));
    setDeletedIds((prev) => new Set([...prev, id]));
    queryClient.invalidateQueries({ queryKey: ["waifuCharacters"] });
    toast.success(`"${name}" deleted.`);
    try {
      await deleteWaifu.mutateAsync(id);
    } catch {
      // localStorage already updated
    }
  };

  const handleAddShopItem = async () => {
    if (!shopForm.name || !shopForm.price) {
      toast.error("Fill in required fields!");
      return;
    }
    try {
      await addShopItem.mutateAsync({
        id: `shop-${Date.now()}`,
        name: shopForm.name,
        description: shopForm.description,
        itemType: shopForm.itemType,
        price: BigInt(Number.parseInt(shopForm.price, 10) || 0),
      });
      toast.success(`Shop item "${shopForm.name}" added!`);
      setShopForm({ name: "", description: "", itemType: "ticket", price: "" });
    } catch {
      toast.error("Failed to add shop item.");
    }
  };

  const handleAddAd = async () => {
    const newAd: Ad = {
      id: `ad-${Date.now()}`,
      title: adForm.title || "Ad",
      imageUrl: adForm.imageUrl,
      videoUrl: adForm.videoUrl,
      link: adForm.link,
    };
    try {
      await addAd.mutateAsync(newAd);
    } catch {
      // localStorage ads fallback
      const lsAds = JSON.parse(localStorage.getItem("sinzhu_ads") || "[]");
      lsAds.push(newAd);
      localStorage.setItem("sinzhu_ads", JSON.stringify(lsAds));
    }
    toast.success("Ad uploaded! ✅");
    setAdForm({ title: "", imageUrl: "", videoUrl: "", link: "" });
  };

  const handleDeleteAd = async (id: string, title: string) => {
    try {
      await deleteAd.mutateAsync(id);
      toast.success(`Ad "${title}" deleted.`);
    } catch {
      toast.error("Failed to delete ad.");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8" data-ocid="admin.section">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-8">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate("home")}
              className="text-xs px-3 py-1.5 rounded-lg mr-1"
              style={{ background: "#1c2733", color: "#8eacbb" }}
              data-ocid="admin.back.button"
            >
              ← Back
            </button>
          )}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "oklch(0.59 0.22 295 / 0.2)",
              border: "1px solid oklch(0.59 0.22 295 / 0.4)",
            }}
          >
            <Shield
              className="w-5 h-5"
              style={{ color: "oklch(0.75 0.18 295)" }}
            />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gradient-pink-cyan">
              Admin Panel
            </h1>
            <p className="text-xs text-muted-foreground">
              Manage waifus, shop, ads and platform settings
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUnlocked(false)}
            className="ml-auto text-xs px-3 py-1.5 rounded-lg"
            style={{ background: "#1c2733", color: "#8eacbb" }}
          >
            🔒 Lock
          </button>
        </div>

        <Tabs defaultValue="waifus">
          <TabsList style={{ background: "oklch(0.13 0.035 290)" }}>
            <TabsTrigger value="waifus" data-ocid="admin.waifus.tab">
              🎴 Waifus
            </TabsTrigger>
            <TabsTrigger value="shop" data-ocid="admin.shop.tab">
              🛍️ Shop
            </TabsTrigger>
            <TabsTrigger value="ads" data-ocid="admin.ads.tab">
              📢 Ads
            </TabsTrigger>
            <TabsTrigger value="coupons" data-ocid="admin.coupons.tab">
              🀄 Coupons
            </TabsTrigger>
          </TabsList>

          {/* WAIFU MANAGEMENT */}
          <TabsContent value="waifus" className="mt-6 space-y-6">
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus
                  className="w-5 h-5"
                  style={{ color: "oklch(0.75 0.22 330)" }}
                />
                Add New Waifu
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Character Name *
                  </p>
                  <Input
                    value={waifuForm.name}
                    onChange={(e) =>
                      setWaifuForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g., Rem"
                    className="mt-1"
                    style={{ background: "oklch(0.10 0.025 290)" }}
                    data-ocid="admin.waifu_name.input"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Series *
                  </p>
                  <Input
                    value={waifuForm.series}
                    onChange={(e) =>
                      setWaifuForm((f) => ({ ...f, series: e.target.value }))
                    }
                    placeholder="e.g., Re:Zero"
                    className="mt-1"
                    style={{ background: "oklch(0.10 0.025 290)" }}
                    data-ocid="admin.waifu_series.input"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Rarity
                  </p>
                  <Select
                    value={waifuForm.rarity}
                    onValueChange={(v) =>
                      setWaifuForm((f) => ({ ...f, rarity: v }))
                    }
                  >
                    <SelectTrigger
                      className="mt-1"
                      style={{ background: "oklch(0.10 0.025 290)" }}
                      data-ocid="admin.waifu_rarity.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{ background: "oklch(0.13 0.035 290)" }}
                    >
                      {Object.entries(RARITY_CONFIG).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          <span style={{ color: val.color }}>{val.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Image URL *
                  </p>
                  <Input
                    value={waifuForm.imageUrl}
                    onChange={(e) =>
                      setWaifuForm((f) => ({ ...f, imageUrl: e.target.value }))
                    }
                    placeholder="https://..."
                    className="mt-1"
                    style={{ background: "oklch(0.10 0.025 290)" }}
                    data-ocid="admin.waifu_image.input"
                  />
                </div>
              </div>
              <Button
                className="btn-pink mt-4 px-6"
                onClick={handleAddWaifu}
                disabled={addWaifu.isPending}
                data-ocid="admin.add_waifu.submit_button"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Waifu
              </Button>
            </div>

            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">
                Existing Characters (
                {(characters ?? []).filter((c) => !deletedIds.has(c.id)).length}
                )
              </h3>
              <div className="space-y-2">
                {(characters ?? [])
                  .filter((c) => !deletedIds.has(c.id))
                  .slice(0, 20)
                  .map((char, i) => (
                    <div
                      key={char.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30"
                      data-ocid={`admin.waifu.item.${i + 1}`}
                    >
                      <img
                        src={char.imageUrl}
                        alt={char.name}
                        className="w-10 h-14 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{char.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {char.series}
                        </p>
                      </div>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: `${RARITY_CONFIG[char.rarity]?.color ?? "#aaa"}22`,
                          color: RARITY_CONFIG[char.rarity]?.color ?? "#aaa",
                        }}
                      >
                        {RARITY_CONFIG[char.rarity]?.label ?? char.rarity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => handleDeleteWaifu(char.id, char.name)}
                        data-ocid={`admin.waifu.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                {(characters ?? []).filter((c) => !deletedIds.has(c.id))
                  .length === 0 && (
                  <p
                    className="text-sm text-muted-foreground text-center py-4"
                    data-ocid="admin.waifus.empty_state"
                  >
                    No characters added yet.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* SHOP MANAGEMENT */}
          <TabsContent value="shop" className="mt-6 space-y-6">
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus
                  className="w-5 h-5"
                  style={{ color: "oklch(0.82 0.15 75)" }}
                />
                Add Shop Item
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="shop-name-field"
                    className="text-sm font-medium"
                  >
                    Item Name *
                  </label>
                  <Input
                    value={shopForm.name}
                    onChange={(e) =>
                      setShopForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g., Legendary Ticket"
                    className="mt-1"
                    style={{ background: "oklch(0.10 0.025 290)" }}
                    id="shop-name"
                    data-ocid="admin.shop_name.input"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Price (Onex) *</p>
                  <Input
                    type="number"
                    value={shopForm.price}
                    onChange={(e) =>
                      setShopForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="e.g., 500"
                    className="mt-1"
                    style={{ background: "oklch(0.10 0.025 290)" }}
                    id="shop-price"
                    data-ocid="admin.shop_price.input"
                  />
                </div>
                <div>
                  <span className="text-sm font-medium">Item Type</span>
                  <Select
                    value={shopForm.itemType}
                    onValueChange={(v) =>
                      setShopForm((f) => ({ ...f, itemType: v }))
                    }
                  >
                    <SelectTrigger
                      className="mt-1"
                      style={{ background: "oklch(0.10 0.025 290)" }}
                      data-ocid="admin.shop_type.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      style={{ background: "oklch(0.13 0.035 290)" }}
                    >
                      {["pass", "ticket", "boost", "upgrade", "cosmetic"].map(
                        (t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium mb-1">Description</p>
                  <Textarea
                    value={shopForm.description}
                    onChange={(e) =>
                      setShopForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Item description..."
                    className="mt-1 resize-none"
                    rows={2}
                    style={{ background: "oklch(0.10 0.025 290)" }}
                    data-ocid="admin.shop_desc.textarea"
                  />
                </div>
              </div>
              <Button
                className="btn-pink mt-4 px-6"
                onClick={handleAddShopItem}
                disabled={addShopItem.isPending}
                data-ocid="admin.add_shop.submit_button"
              >
                <Package className="w-4 h-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">
                Shop Items ({(shopItems ?? []).length})
              </h3>
              <div className="space-y-2">
                {(shopItems ?? []).map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30"
                    data-ocid={`admin.shop.item.${i + 1}`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                      style={{ background: "oklch(0.16 0.04 290)" }}
                    >
                      📦
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.itemType} — {Number(item.price)} Onex
                      </p>
                    </div>
                  </div>
                ))}
                {(!shopItems || shopItems.length === 0) && (
                  <p
                    className="text-sm text-muted-foreground text-center py-4"
                    data-ocid="admin.shop.empty_state"
                  >
                    No items added yet.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ADS MANAGEMENT */}
          <TabsContent value="ads" className="mt-6 space-y-6">
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Plus
                  className="w-5 h-5"
                  style={{ color: "oklch(0.75 0.22 330)" }}
                />
                Add New Ad
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <p className="text-sm font-medium text-foreground mb-1">
                    Ad Title *
                  </p>
                  <Input
                    value={adForm.title}
                    onChange={(e) =>
                      setAdForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="e.g., Special Sale!"
                    style={{ background: "oklch(0.10 0.025 290)" }}
                    data-ocid="admin.ad_title.input"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Image URL
                  </p>
                  <Input
                    value={adForm.imageUrl}
                    onChange={(e) =>
                      setAdForm((f) => ({ ...f, imageUrl: e.target.value }))
                    }
                    placeholder="https://example.com/banner.jpg"
                    style={{ background: "oklch(0.10 0.025 290)" }}
                    data-ocid="admin.ad_image.input"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click Link
                  </p>
                  <Input
                    value={adForm.link}
                    onChange={(e) =>
                      setAdForm((f) => ({ ...f, link: e.target.value }))
                    }
                    placeholder="https://..."
                    style={{ background: "oklch(0.10 0.025 290)" }}
                    data-ocid="admin.ad_link.input"
                  />
                </div>
              </div>
              <Button
                className="btn-pink mt-4 px-6"
                onClick={handleAddAd}
                disabled={addAd.isPending}
                data-ocid="admin.add_ad.submit_button"
              >
                <Upload className="w-4 h-4 mr-2" />
                Add Ad
              </Button>
            </div>

            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">
                Active Ads ({(ads ?? []).length})
              </h3>
              <div className="space-y-2">
                {(ads ?? []).map((ad, i) => (
                  <div
                    key={ad.id}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30"
                    data-ocid={`admin.ads.item.${i + 1}`}
                  >
                    {ad.imageUrl ? (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="w-14 h-10 object-cover rounded-lg shrink-0"
                      />
                    ) : (
                      <div
                        className="w-14 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                        style={{ background: "oklch(0.16 0.04 290)" }}
                      >
                        🖼️
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {ad.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {ad.link || "No link"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDeleteAd(ad.id, ad.title)}
                      disabled={deleteAd.isPending}
                      data-ocid={`admin.ads.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {(!ads || ads.length === 0) && (
                  <p
                    className="text-sm text-muted-foreground text-center py-4"
                    data-ocid="admin.ads.empty_state"
                  >
                    No ads added yet.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="coupons" className="mt-6 space-y-6">
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Create Coupon Code</h3>
              <CouponAdminForm />
            </div>
            <div className="card-glass rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4">Active Coupons</h3>
              <CouponList />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}

function CouponAdminForm() {
  const [onexAmount, setOnexAmount] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const handleCreate = () => {
    const amount = Number.parseInt(onexAmount, 10);
    const code = couponCode.trim().toUpperCase();
    if (!amount || amount <= 0) {
      toast.error("❌ Enter a valid Onex amount");
      return;
    }
    if (code.length !== 6) {
      toast.error("❌ Coupon code must be exactly 6 characters");
      return;
    }
    const couponsRaw = localStorage.getItem("sinzhu_coupons");
    const coupons: { code: string; onex: number; usedBy: string[] }[] =
      couponsRaw ? JSON.parse(couponsRaw) : [];
    if (coupons.some((c) => c.code === code)) {
      toast.error("❌ Coupon code already exists");
      return;
    }
    coupons.push({ code, onex: amount, usedBy: [] });
    localStorage.setItem("sinzhu_coupons", JSON.stringify(coupons));
    toast.success("✅ Coupon created!");
    setOnexAmount("");
    setCouponCode("");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground mb-1">
          Onex Reward Amount
        </p>
        <Input
          type="number"
          value={onexAmount}
          onChange={(e) => setOnexAmount(e.target.value)}
          placeholder="e.g. 500"
          min={1}
          style={{ background: "oklch(0.10 0.025 290)" }}
          data-ocid="admin.coupon_onex.input"
        />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground mb-1">
          Coupon Code (6 digits)
        </p>
        <Input
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          maxLength={6}
          placeholder="e.g. ABC123"
          style={{
            background: "oklch(0.10 0.025 290)",
            letterSpacing: "0.2em",
          }}
          data-ocid="admin.coupon_code.input"
        />
      </div>
      <Button
        className="btn-pink px-6"
        onClick={handleCreate}
        data-ocid="admin.create_coupon.submit_button"
      >
        ✅ OK / Create
      </Button>
    </div>
  );
}

function CouponList() {
  const [, forceUpdate] = useState(0);
  const couponsRaw = localStorage.getItem("sinzhu_coupons");
  const coupons: { code: string; onex: number; usedBy: string[] }[] = couponsRaw
    ? JSON.parse(couponsRaw)
    : [];

  const handleDelete = (code: string) => {
    const couponsRaw2 = localStorage.getItem("sinzhu_coupons");
    const list: { code: string; onex: number; usedBy: string[] }[] = couponsRaw2
      ? JSON.parse(couponsRaw2)
      : [];
    const updated = list.filter((c) => c.code !== code);
    localStorage.setItem("sinzhu_coupons", JSON.stringify(updated));
    toast.success("🗑️ Coupon deleted");
    forceUpdate((n) => n + 1);
  };

  if (coupons.length === 0) {
    return (
      <p
        className="text-sm text-muted-foreground"
        data-ocid="admin.coupons.empty_state"
      >
        No coupons created yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {coupons.map((coupon, i) => (
        <div
          key={coupon.code}
          className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/30"
          style={{
            background: "oklch(0.12 0.03 290)",
            border: "1px solid oklch(0.20 0.04 290)",
          }}
          data-ocid={`admin.coupon.item.${i + 1}`}
        >
          <div>
            <p
              className="font-bold tracking-widest text-sm"
              style={{ letterSpacing: "0.2em" }}
            >
              {coupon.code}
            </p>
            <p className="text-xs text-muted-foreground">
              {coupon.onex} Onex • Used by {coupon.usedBy.length} user(s)
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
            onClick={() => handleDelete(coupon.code)}
            data-ocid={`admin.coupon.delete_button.${i + 1}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
