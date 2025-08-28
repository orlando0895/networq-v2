import { supabase } from '@/integrations/supabase/client';

// Singleton subscription manager to prevent duplicate subscriptions in StrictMode
class SupabaseSubscriptionManager {
  private channels = new Map<string, any>();

  getOrCreateChannel(channelName: string, config: () => any) {
    // If channel already exists, return it
    if (this.channels.has(channelName)) {
      console.log(`🔄 Reusing existing channel: ${channelName}`);
      return this.channels.get(channelName);
    }

    // Create new channel
    console.log(`🆕 Creating new channel: ${channelName}`);
    try {
      const channel = config();
      this.channels.set(channelName, channel);
      console.log(`✅ Successfully created channel: ${channelName}`);
      return channel;
    } catch (error) {
      console.error(`❌ Failed to create channel ${channelName}:`, error);
      throw error;
    }
  }

  removeChannel(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      console.log(`Removing channel: ${channelName}`);
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  cleanup() {
    console.log('Cleaning up all channels');
    this.channels.forEach((channel, name) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

// Export singleton instance
export const subscriptionManager = new SupabaseSubscriptionManager();